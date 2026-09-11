import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as api from "@biji/client";
import { json } from "../respond.js";

export function register(server: McpServer): void {
  server.tool(
    "yoda_create_chat",
    "Create a new Yoda AI chat session",
    {
      upstream: z.string().describe("Upstream source type (e.g. 'note', 'topic')"),
      res_id: z.string().optional().describe("Resource ID to associate with the chat"),
    },
    async ({ upstream, res_id }) => {
      const res = await api.createYodaChat(upstream, res_id);
      return json(res);
    }
  );

  server.tool(
    "yoda_list_chats",
    "List Yoda AI chat history",
    {
      page_cursor: z.string().optional().describe("Pagination cursor"),
      page_size: z.number().optional().default(15),
      upstream: z.string().optional().describe("Filter by upstream type"),
    },
    async ({ page_cursor, page_size, upstream }) => {
      const res = await api.listYodaChats(page_cursor, page_size, upstream);
      return json(res);
    }
  );

  server.tool(
    "yoda_get_chat_messages",
    "Get messages in a Yoda AI chat session",
    {
      session_id: z.string().describe("Chat session ID"),
      page_cursor: z.string().optional(),
      page_size: z.number().optional().default(20),
    },
    async ({ session_id, page_cursor, page_size }) => {
      const res = await api.getYodaChatMessages(session_id, page_cursor, page_size);
      return json(res);
    }
  );

  server.tool(
    "yoda_chat_entry",
    "Get or create a Yoda chat session by entry point (e.g. from a note or topic)",
    {
      upstream: z.string().describe("Upstream type"),
      id: z.string().optional().describe("Entity ID"),
    },
    async ({ upstream, id }) => {
      const res = await api.getYodaChatEntry(upstream, id);
      return json(res);
    }
  );

  server.tool(
    "yoda_chat_stream",
    "Ask Yoda AI a question with RAG over your notes and return the complete answer. " +
      "Pass just `question` to start a fresh session (the new session_id is returned), or pass `session_id` to continue an existing one. " +
      "Scope flags (`notes`/`web`/`dedao`) control retrieval. `parent_id` is auto-resolved to the session's last answer for multi-turn continuity. " +
      "Use `raw_body` only for advanced overrides of the upstream payload.",
    {
      question: z.string().describe("The question / message to send to Yoda AI"),
      session_id: z.string().optional().describe("Existing session to continue. Omit to auto-create a new session (its id is returned)."),
      notes: z.boolean().optional().default(true).describe("RAG over your notes (default: true)"),
      web: z.boolean().optional().default(false).describe("Enable web search (default: false)"),
      dedao: z.boolean().optional().default(false).describe("Enable Dedao (得到) knowledge base (default: false)"),
      parent_id: z.string().optional().describe("Parent assistant message id for multi-turn continuity. Auto-resolved to the session's last answer when omitted."),
      action: z.string().optional().default("next").describe("Upstream action (default: 'next')"),
      mode: z.string().optional().default("AUTO").describe("Retrieval mode (default: 'AUTO')"),
      raw_body: z.record(z.string(), z.unknown()).optional().describe("Advanced: extra fields shallow-merged over the constructed body (escape hatch for the full upstream schema)."),
    },
    async ({ question, session_id, notes, web, dedao, parent_id, action, mode, raw_body }) => {
      // 1. Resolve session: continue the given one, or create a fresh session.
      let sid = session_id;
      let newSession = false;
      if (!sid) {
        const created = (await api.createYodaChat("")) as { c?: { id?: string; session?: { id?: string } } };
        sid = created?.c?.id ?? created?.c?.session?.id;
        if (!sid) {
          return { isError: true, content: [{ type: "text", text: `Failed to create a Yoda session: ${JSON.stringify(created).slice(0, 300)}` }] };
        }
        newSession = true;
      }
      // 2. Resolve parent_id for continuity (last assistant message of the session).
      let pid = parent_id ?? "";
      if (!parent_id && !newSession) {
        try {
          const msgs = (await api.getYodaChatMessages(sid, undefined, 50)) as { c?: { items?: Array<{ role?: string; message_id?: string }> } };
          const items = msgs?.c?.items ?? [];
          for (let i = items.length - 1; i >= 0; i--) {
            if (items[i].role === "assistant" && items[i].message_id) { pid = items[i].message_id as string; break; }
          }
        } catch { /* best-effort; fall back to empty parent */ }
      }
      // 3. Build the canonical body (mirrors the CLI `biji chat` payload), then
      //    shallow-merge raw_body for advanced overrides.
      const body: Record<string, unknown> = {
        mode,
        notes: { select_all: notes !== false },
        web: Boolean(web),
        dedao: Boolean(dedao),
        study: false,
        topics: {},
        selected_resources: [],
        parent_id: pid,
        question,
        action,
        session_id: sid,
        ...(raw_body ?? {}),
      };
      const res = await api.yodaChatStream(body);
      return json({ session_id: sid, new_session: newSession, ai_response: res.content, event_count: res.events.length });
    }
  );

  server.tool(
    "yoda_stop_stream",
    "Stop a Yoda AI chat stream",
    {
      session_id: z.string().describe("Chat session ID"),
      message_id: z.string().describe("Message ID to stop"),
    },
    async ({ session_id, message_id }) => {
      const res = await api.stopYodaChatStream(session_id, message_id);
      return json(res);
    }
  );

  server.tool(
    "yoda_startup_questions",
    "Get AI-suggested startup questions for Yoda chat",
    { params: z.record(z.string(), z.unknown()).optional().describe("Optional params") },
    async ({ params }) => {
      const res = await api.getYodaStartupQuestions(params || undefined);
      return json(res);
    }
  );

  server.tool(
    "yoda_startup_shortcuts",
    "Get AI-suggested shortcuts for Yoda chat",
    {
      upstream: z.string().describe("Upstream type"),
      upstream_entity_id: z.string().optional().describe("Entity ID"),
    },
    async ({ upstream, upstream_entity_id }) => {
      const res = await api.getYodaStartupShortcuts(upstream, upstream_entity_id);
      return json(res);
    }
  );

  server.tool(
    "yoda_set_chat_title",
    "Set the title for a Yoda chat session",
    {
      session_id: z.string().describe("Chat session ID"),
      title: z.string().describe("New title"),
    },
    async ({ session_id, title }) => {
      const res = await api.setYodaChatTitle(session_id, title);
      return json(res);
    }
  );

  server.tool(
    "yoda_get_shared_chat",
    "Get a shared Yoda chat by share ID",
    { share_id: z.string().describe("Share ID") },
    async ({ share_id }) => {
      const res = await api.getYodaSharedChat(share_id);
      return json(res);
    }
  );

  server.tool("yoda_resource_config", "Get Yoda resource upload configuration", {}, async () => {
    const res = await api.getYodaResourceConfig();
    return json(res);
  });

  server.tool(
    "yoda_send_feedback",
    "Send feedback (thumbs up/down) for a Yoda AI message",
    {
      session_id: z.string().describe("Chat session ID"),
      message_id: z.string().describe("Message ID"),
      feedback_type: z.string().optional().default("thumbs_down").describe("Feedback type: thumbs_up or thumbs_down"),
      comment: z.string().optional().describe("Comment"),
    },
    async ({ session_id, message_id, feedback_type, comment }) => {
      const res = await api.sendYodaFeedback({ sessionId: session_id, messageId: message_id, feedbackType: feedback_type, comment });
      return json(res);
    }
  );

  server.tool(
    "yoda_create_ai_note",
    "Create a note via Yoda AI",
    { params: z.record(z.string(), z.unknown()).describe("AI note creation params") },
    async ({ params }) => {
      const res = await api.createYodaAiNote(params);
      return json(res);
    }
  );
}
