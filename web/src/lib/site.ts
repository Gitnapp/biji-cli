export const site = {
  name: "get-biji-api",
  tagline: "The unofficial Get笔记 toolkit",
  description:
    "A shared TypeScript SDK, a full-featured CLI, and an MCP server for biji.com (Get笔记).",
  repo: "https://github.com/Gitnapp/get-biji-api",
  npm: {
    client: "@biji/client",
    cli: "@biji/cli",
    mcp: "@biji/mcp",
    queue: "@biji/queue",
  },
  stats: {
    endpoints: 117,
    mcpTools: 81,
    packages: 4,
  },
} as const

export const navLinks = [
  { label: "Docs", href: "/docs/introduction", internal: true },
  { label: "CLI", href: "/docs/cli/notes", internal: true },
  { label: "MCP", href: "/docs/mcp-server", internal: true },
  { label: "SDK", href: "/docs/sdk", internal: true },
] as const
