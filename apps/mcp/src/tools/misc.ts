import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as api from "@biji/client";
import { json } from "../respond.js";

export function register(server: McpServer): void {
  // ──────────────────── Follow Tools ────────────────────

  server.tool("list_follows", "List all followed sources", {}, async () => {
    const res = await api.listFollows();
    return json(res);
  });

  server.tool(
    "create_follow",
    "Follow a new content source by URL",
    { url: z.string().describe("URL to follow") },
    async ({ url }) => {
      const res = await api.createFollow(url);
      return json(res);
    }
  );

  server.tool(
    "delete_follow",
    "Unfollow a content source",
    { follow_id: z.string().describe("Follow ID") },
    async ({ follow_id }) => {
      const res = await api.deleteFollow(follow_id);
      return json(res);
    }
  );

  server.tool(
    "get_follow_posts",
    "Get posts from a followed source",
    { follow_id: z.string().describe("Follow ID") },
    async ({ follow_id }) => {
      const res = await api.getFollowPosts(follow_id);
      return json(res);
    }
  );

  // ──────────────────── Team Tools ────────────────────

  server.tool(
    "list_teams",
    "List teams",
    { is_owner: z.boolean().optional().describe("Filter by ownership") },
    async ({ is_owner }) => {
      const res = await api.listTeams(is_owner);
      return json(res);
    }
  );

  server.tool(
    "get_team_info",
    "Get team details",
    { id_alias: z.string().describe("Team alias ID") },
    async ({ id_alias }) => {
      const res = await api.getTeamInfo(id_alias);
      return json(res);
    }
  );

  server.tool(
    "create_team",
    "Create a new team",
    { name: z.string().describe("Team name") },
    async ({ name }) => {
      const res = await api.createTeam(name);
      return json(res);
    }
  );

  // ──────────────────── Export Tools ────────────────────

  server.tool(
    "export_notes",
    "Create an export task for one or more notes. Server returns the task id; poll with get_export_task (or use wait_for_export_task) to obtain the presigned download URL.",
    {
      note_ids: z.array(z.string()).min(1).describe("Note IDs to export"),
      type: z.enum(["pdf", "docx", "md", "mp3"]).describe("Export format. 'mp3' only works for audio-type notes."),
    },
    async ({ note_ids, type }) => {
      const res = await api.createExportTask(note_ids, type);
      return json(res);
    }
  );

  server.tool(
    "get_export_task",
    "Get the current status of an export task. `access_url` is populated once `status === 'success'`.",
    { task_id: z.string().describe("Export task id from export_notes") },
    async ({ task_id }) => {
      const res = await api.getExportTask(task_id);
      return json(res);
    }
  );

  server.tool(
    "wait_for_export_task",
    "Poll an export task until it finishes (or times out). Returns the final task with `access_url` set.",
    {
      task_id: z.string().describe("Export task id from export_notes"),
      poll_interval_ms: z.number().optional().describe("Poll interval (default 1000ms)"),
      timeout_ms: z.number().optional().describe("Hard timeout (default 120000ms)"),
    },
    async ({ task_id, poll_interval_ms, timeout_ms }) => {
      const task = await api.waitForExportTask(task_id, {
        pollIntervalMs: poll_interval_ms,
        timeoutMs: timeout_ms,
      });
      return json(task);
    }
  );

  server.tool("list_export_tasks", "List export task history", {}, async () => {
    const res = await api.listExportTasks();
    return json(res);
  });

  // ──────────────────── Share Tools ────────────────────

  server.tool(
    "get_shared_note",
    "Get a shared note by ID",
    { note_id: z.string().describe("Shared note ID") },
    async ({ note_id }) => {
      const res = await api.getSharedNote(note_id);
      return json(res);
    }
  );

  // ──────────────────── Search History Tools ────────────────────

  server.tool(
    "get_search_history",
    "Get search history",
    { topic_id: z.string().optional().describe("Topic ID to filter by") },
    async ({ topic_id }) => {
      const res = await api.getSearchHistory(topic_id);
      return json(res);
    }
  );

  // ──────────────────── OpenAPI Token Tools ────────────────────

  server.tool(
    "list_openapi_tokens",
    "List OpenAPI tokens for a topic",
    { topic_id: z.string().describe("Topic ID") },
    async ({ topic_id }) => {
      const res = await api.listOpenapiTokens(topic_id);
      return json(res);
    }
  );

  server.tool(
    "create_openapi_token",
    "Create a new OpenAPI token for a topic",
    { topic_id: z.string().describe("Topic ID") },
    async ({ topic_id }) => {
      const res = await api.createOpenapiToken(topic_id);
      return json(res);
    }
  );
}
