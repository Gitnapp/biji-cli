import { Command } from "commander";
import { startMcpServer } from "@gitnapp/biji-mcp";
import { VERSION } from "../version.js";

export function registerMcpCommand(program: Command): void {
  program
    .command("mcp")
    .description("Run the MCP server on stdio (what `biji setup add <client>` registers)")
    .action(async () => {
      await startMcpServer(VERSION);
    });
}
