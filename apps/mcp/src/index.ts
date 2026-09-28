#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as api from "@gitnapp/biji-client";
import * as auth from "./tools/auth.js";
import * as notes from "./tools/notes.js";
import * as topics from "./tools/topics.js";
import * as misc from "./tools/misc.js";
import * as yoda from "./tools/yoda.js";
import * as ai from "./tools/ai.js";
import * as queueTools from "./tools/queue.js";

const server = new McpServer({
  name: "get-biji",
  version: "0.1.0",
  description: "MCP server for Get笔记 (biji.com) — AI-driven note-taking app",
});

auth.register(server);
notes.register(server);
topics.register(server);
misc.register(server);
yoda.register(server);
ai.register(server);
queueTools.register(server);

// ──────────────────── Start Server ────────────────────

async function main() {
  // Auto-load auth from env vars or saved file
  if (api.loadAuth()) {
    const authState = api.getAuth();
    const now = Math.floor(Date.now() / 1000);
    if (authState.refresh_token) {
      const days = Math.floor((authState.refresh_token_expire_at - now) / 86400);
      console.error(`[startup] auth loaded (refresh_token expires in ${days} days)`);
    } else {
      console.error("[startup] token loaded (no auto-refresh)");
    }
  } else {
    console.error("[startup] no saved auth found, use set_auth or set_token to authenticate");
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Get笔记 MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
