import { Link } from "react-router-dom"
import { ArrowRight, Check } from "lucide-react"
import { Terminal } from "@/components/terminal"
import { Reveal, Section } from "./primitives"

const toolGroups = [
  "Notes",
  "Tags",
  "Topics",
  "Knowledge Base",
  "Yoda Chat",
  "AI Writing",
  "Media Upload",
  "Export",
  "Canvas",
  "Queue",
]

export function McpSection() {
  return (
    <Section id="mcp">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Model Context Protocol
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Give Claude your Get笔记
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Point Claude Desktop or Claude Code at the stdio MCP server and it can
            search, write, upload, export, and chat over your notes — <span className="font-medium text-foreground">~81 tools</span> across
            ten categories, sharing the same background queue as the CLI.
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {toolGroups.map((g) => (
              <li
                key={g}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {g}
              </li>
            ))}
          </ul>

          <Link
            to="/docs/mcp-server"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Set up the MCP server <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <Terminal title="claude_desktop_config.json">
            <pre className="whitespace-pre text-[13px] leading-relaxed">
              <span className="text-zinc-500">{"{"}</span>
              {"\n  "}
              <span className="text-cyan-300">"mcpServers"</span>: {"{"}
              {"\n    "}
              <span className="text-cyan-300">"get-biji"</span>: {"{"}
              {"\n      "}
              <span className="text-cyan-300">"command"</span>:{" "}
              <span className="text-emerald-300">"node"</span>,{"\n      "}
              <span className="text-cyan-300">"args"</span>: [
              {"\n        "}
              <span className="text-emerald-300">
                "/path/to/get-biji-api/apps/mcp/dist/index.js"
              </span>
              {"\n      "}]
              {"\n    "}
              {"}"}
              {"\n  "}
              {"}"}
              {"\n"}
              <span className="text-zinc-500">{"}"}</span>
            </pre>
          </Terminal>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Run <code className="font-mono text-foreground/80">biji auth login</code> once,
            then Claude shares your session.
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
