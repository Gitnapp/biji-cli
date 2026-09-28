# @gitnapp/biji-cli

`biji` — CLI and MCP server for Get笔记 (biji.com). Write / link / search / edit notes, manage knowledge bases, upload audio/video, export, chat with Yoda, and batch jobs through a background queue. `biji mcp` serves the same features (~100 tools) to AI clients over stdio.

Requires Node ≥22.13. The package is a single self-contained file with no dependencies.

```bash
npm i -g @gitnapp/biji-cli
biji auth login
biji search "关键词"
biji --ai                       # compact usage guide for AI agents
```

## MCP

```bash
biji setup add claude-code      # also: claude-desktop / cursor / windsurf / cline / gemini
biji setup list                 # config paths + status
biji mcp                        # run the stdio server directly
```

`setup add` registers this install's absolute path (`<node> <.../biji.js> mcp`). Use `--npx` to register `npx -y @gitnapp/biji-cli mcp` instead, or configure it by hand:

```json
{ "mcpServers": { "get-biji": { "command": "npx", "args": ["-y", "@gitnapp/biji-cli", "mcp"] } } }
```

`biji doctor` checks runtime, auth, queue and MCP-client setup. Full docs: https://github.com/Gitnapp/biji-cli
