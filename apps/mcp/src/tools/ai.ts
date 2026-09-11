import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as api from "@biji/client";
import { json } from "../respond.js";

export function register(server: McpServer): void {
  // ──────────────────── AI: Writing ────────────────────

  server.tool(
    "ai_writing_stream",
    "AI writing assistant — generate content with streaming",
    { params: z.record(z.string(), z.unknown()).describe("Writing params (e.g. prompt, style, topic)") },
    async ({ params }) => {
      const res = await api.aiWritingStream(params);
      return json({ ai_content: res.content, event_count: res.events.length });
    }
  );

  server.tool("list_ai_writers", "List available AI writer personas", {}, async () => {
    const res = await api.listAiWriters();
    return json(res);
  });

  // ──────────────────── AI: Style ────────────────────

  server.tool(
    "ai_style_gen_stream",
    "Generate AI writing style with streaming",
    { params: z.record(z.string(), z.unknown()).describe("Style generation params") },
    async ({ params }) => {
      const res = await api.aiStyleGenStream(params);
      return json({ ai_content: res.content, event_count: res.events.length });
    }
  );

  server.tool("list_style_polishers", "List AI style polishers (for refining writing)", {}, async () => {
    const res = await api.listStylePolishers();
    return json(res);
  });

  server.tool("list_styles", "List all writing styles", {}, async () => {
    const res = await api.listStyles();
    return json(res);
  });

  server.tool(
    "create_style",
    "Create a new writing style",
    { params: z.record(z.string(), z.unknown()).describe("Style params (name, description, etc.)") },
    async ({ params }) => {
      const res = await api.createStyle(params);
      return json(res);
    }
  );

  server.tool(
    "update_style",
    "Update an existing writing style",
    { params: z.record(z.string(), z.unknown()).describe("Updated style params") },
    async ({ params }) => {
      const res = await api.updateStyle(params);
      return json(res);
    }
  );

  server.tool(
    "delete_style",
    "Delete a writing style",
    { params: z.record(z.string(), z.unknown()).describe("Style to delete (id)") },
    async ({ params }) => {
      const res = await api.deleteStyle(params);
      return json(res);
    }
  );

  // ──────────────────── AI: Canvas ────────────────────

  server.tool(
    "save_canvas",
    "Save a canvas (AI-generated visual note)",
    { params: z.record(z.string(), z.unknown()).describe("Canvas data to save") },
    async ({ params }) => {
      const res = await api.saveCanvas(params);
      return json(res);
    }
  );

  server.tool("get_canvas_history", "Get canvas edit history", {}, async () => {
    const res = await api.getCanvasHistory();
    return json(res);
  });

  // ──────────────────── AI: Blogger Recognition ────────────────────

  server.tool(
    "recognize_weixin_blogger",
    "AI-recognize a WeChat blogger from a URL (extracts blogger info)",
    { url: z.string().describe("WeChat article or blogger URL") },
    async ({ url }) => {
      const res = await api.recognizeWeixinBlogger(url);
      return json(res);
    }
  );
}
