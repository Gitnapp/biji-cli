import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as queue from "@gitnapp/biji-queue";
import { json } from "../respond.js";

// ──────────────────── Queue (background batch jobs) ────────────────────
//
// Submit lots of URLs (or files) at once, return immediately, and let a
// local background worker process them serially-with-concurrency-3 against
// biji.com. Deduplication, retries with exponential backoff, and a per-job
// timeout are handled inside @gitnapp/biji-queue. The worker is a separate detached
// process so this MCP server can exit and the worker keeps going.

export function register(server: McpServer): void {
  server.tool(
    "queue_add",
    "Enqueue one or more URLs as background link-analysis jobs. Returns immediately; the worker auto-starts. Duplicates (pending/running/done with same URL) are skipped unless force=true.",
    {
      urls: z.array(z.string()).describe("URLs to analyze. Each becomes one job."),
      topic_alias: z.string().optional().describe("KB topic alias to drop resulting notes into (e.g. 'pYLReLmJ'). Omit for default 'all notes'."),
      prompt: z.string().optional().describe("Custom AI instruction applied to every URL in this batch."),
      batch: z.string().optional().describe("Tag jobs with a batch id so they can be retrieved as a group later."),
      max_attempts: z.number().optional().describe("Max retries per job before giving up. Default 3."),
      force: z.boolean().optional().describe("Bypass dedupe — enqueue even if the same URL is already pending/running/done."),
    },
    async ({ urls, topic_alias, prompt, batch, max_attempts, force }) => {
      const ids: string[] = [];
      const duplicates: Array<{ url: string; existing_id: string; status: string }> = [];
      for (const url of urls) {
        const payload: queue.LinkPayload = { url };
        if (prompt) payload.prompt = prompt;
        if (topic_alias) payload.topic_alias = topic_alias;
        const r = queue.addJob(
          { kind: "link", payload, batch_id: batch, max_attempts: max_attempts ?? 3 },
          { force },
        );
        if (r.id) ids.push(r.id);
        else if (r.deduped) duplicates.push({ url, existing_id: r.deduped.id, status: r.deduped.status });
      }
      const daemon = ids.length > 0 ? queue.ensureDaemon() : null;
      return json({
        enqueued: ids.length,
        ids,
        skipped: duplicates.length,
        duplicates,
        daemon,
        tip: "Track with queue_status, queue_list, or queue_show. Worker runs in the background and exits 5min after the queue drains.",
      });
    },
  );

  server.tool(
    "queue_upload",
    "Enqueue local audio/video files as background upload+analyze jobs. Each file goes through OSS PUT then biji's ASR/structured-note pipeline. Duplicates (same file path, pending/running/done) are skipped unless force=true.",
    {
      files: z.array(z.string()).describe("Absolute or cwd-relative file paths."),
      topic_alias: z.string().optional().describe("KB topic alias to drop notes into."),
      prompt: z.string().optional().describe("Custom AI instruction."),
      kind: z.enum(["audio", "video"]).optional().describe("Override media kind. Auto-detected from extension if omitted."),
      batch: z.string().optional(),
      max_attempts: z.number().optional(),
      force: z.boolean().optional(),
    },
    async ({ files, topic_alias, prompt, kind, batch, max_attempts, force }) => {
      const ids: string[] = [];
      const duplicates: Array<{ file: string; existing_id: string; status: string }> = [];
      for (const file of files) {
        const payload: queue.UploadPayload = { file };
        if (prompt) payload.prompt = prompt;
        if (topic_alias) payload.topic_alias = topic_alias;
        if (kind) payload.kind = kind;
        const r = queue.addJob(
          { kind: "upload", payload, batch_id: batch, max_attempts: max_attempts ?? 3 },
          { force },
        );
        if (r.id) ids.push(r.id);
        else if (r.deduped) duplicates.push({ file, existing_id: r.deduped.id, status: r.deduped.status });
      }
      const daemon = ids.length > 0 ? queue.ensureDaemon() : null;
      return json({ enqueued: ids.length, ids, skipped: duplicates.length, duplicates, daemon });
    },
  );

  server.tool(
    "queue_status",
    "Show queue overview: worker liveness, count per status, log path.",
    {},
    async () => {
      const alive = queue.isWorkerAlive();
      const c = queue.counts();
      return json({ worker: alive, counts: c, log_path: queue.logPath() });
    },
  );

  server.tool(
    "queue_list",
    "List recent jobs (newest first). Filter by status and/or batch id.",
    {
      status: z.enum(["pending", "running", "done", "failed", "canceled"]).optional(),
      limit: z.number().optional().describe("Default 20."),
      batch: z.string().optional().describe("Filter by batch id."),
    },
    async ({ status, limit, batch }) => {
      const jobs = queue.listJobs({ status, limit: limit ?? 20, batch_id: batch });
      return json(jobs);
    },
  );

  server.tool(
    "queue_show",
    "Get the full record of one job (payload, result, error, timestamps).",
    { id: z.string().describe("Job id from queue_add or queue_list.") },
    async ({ id }) => {
      const job = queue.getJob(id);
      return {
        content: [{ type: "text", text: job ? JSON.stringify(job, null, 2) : `Job not found: ${id}` }],
      };
    },
  );

  server.tool(
    "queue_retry",
    "Re-queue failed jobs. Pass `ids` to retry specific jobs, or `all_failed=true` to retry every failed job.",
    {
      ids: z.array(z.string()).optional().describe("Job ids to retry. Ignored when all_failed=true."),
      all_failed: z.boolean().optional().describe("Retry every job currently in 'failed' status."),
    },
    async ({ ids, all_failed }) => {
      if (!ids?.length && !all_failed) {
        return { content: [{ type: "text", text: "Provide either `ids` or `all_failed=true`." }] };
      }
      const n = queue.requeueFailed(all_failed ? [] : (ids ?? []));
      const daemon = n > 0 ? queue.ensureDaemon() : null;
      return json({ requeued: n, daemon });
    },
  );

  server.tool(
    "queue_cancel",
    "Cancel pending jobs. Already-running jobs are NOT interrupted.",
    { ids: z.array(z.string()) },
    async ({ ids }) => {
      let canceled = 0;
      for (const id of ids) if (queue.cancelJob(id)) canceled++;
      return json({ canceled, total: ids.length });
    },
  );
}
