# @gitnapp/biji-queue

Local SQLite-backed job queue + detached background worker for biji.com batch jobs (link analysis, media upload).
Used by `@gitnapp/biji-cli` and `@gitnapp/biji-mcp`.

Requires Node >=22.13 (uses the built-in `node:sqlite`, no native addons). State lives in `$XDG_CONFIG_HOME/get-biji/queue/` (`queue.db`, `worker.pid`, `worker.log`).

```ts
import { addJob, ensureDaemon, counts, listJobs } from "@gitnapp/biji-queue";

const r = addJob({ kind: "link", payload: { url: "https://example.com/post" } });
if (r.deduped) console.log("already queued:", r.deduped.id);
ensureDaemon();            // spawns the worker if it isn't running
console.log(counts());     // { pending, running, done, failed, canceled, total }
```

Jobs are deduplicated by target (URL for `link`, file path for `upload`) against pending/running/done rows; pass `{ force: true }` to `addJob` to bypass. The worker runs jobs with bounded concurrency, retries up to `max_attempts`, and exits after an idle period. It can also be run in the foreground via the `biji-queue-worker` bin.
