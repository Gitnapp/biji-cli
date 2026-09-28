#!/usr/bin/env node
/**
 * Entry for the standalone `biji` executable (built with `bun build --compile`).
 * One binary dispatches to three programs:
 *
 *   biji mcp              → MCP server on stdio (what `biji setup add` registers)
 *   biji __queue-worker   → background queue worker (spawned by ensureDaemon)
 *   biji <anything else>  → the regular CLI
 *
 * Each target runs on import, so they are required lazily after the hooks below
 * are installed.
 */
import { setWorkerCommand } from "@biji/queue";
import { useSelfHostedServer } from "@biji/cli/dist/mcp-targets.js";

const WORKER_CMD = "__queue-worker";

setWorkerCommand([WORKER_CMD]);
useSelfHostedServer();

const sub = process.argv[2];
if (sub === "mcp" || sub === WORKER_CMD) {
  process.argv.splice(2, 1);
  if (sub === "mcp") require("biji-mcp/dist/index.js");
  else require("@biji/queue/dist/bin/worker.js");
} else {
  require("@biji/cli/dist/cli.js");
}
