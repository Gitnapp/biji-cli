import { ArrowDown, Boxes, Cloud, Database, TerminalSquare, Workflow } from "lucide-react"
import { Reveal, Section, SectionHeading } from "./primitives"
import { cn } from "@/lib/utils"

function Node({
  icon,
  title,
  subtitle,
  highlight,
  className,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border bg-card p-4 text-center shadow-sm",
        highlight
          ? "border-primary/40 bg-primary/5 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.5)]"
          : "border-border",
        className,
      )}
    >
      <div
        className={cn(
          "mb-2 flex h-9 w-9 items-center justify-center rounded-lg",
          highlight
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {subtitle && (
        <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
      )}
    </div>
  )
}

function Connector() {
  return (
    <div className="flex justify-center py-2">
      <ArrowDown className="h-5 w-5 text-border" />
    </div>
  )
}

export function Architecture() {
  return (
    <Section id="architecture">
      <Reveal>
        <SectionHeading
          eyebrow="How it fits together"
          title="One SDK under every surface"
          description="The CLI, the MCP server, and your own apps all flow through @biji/client — one auth layer, one streaming primitive, one set of endpoints."
        />
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-14 max-w-3xl">
        {/* surfaces */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Node
            icon={<TerminalSquare className="h-5 w-5" />}
            title="@biji/cli"
            subtitle="terminal"
          />
          <Node
            icon={<Workflow className="h-5 w-5" />}
            title="@biji/mcp"
            subtitle="Claude Desktop / Code"
          />
          <Node
            icon={<Boxes className="h-5 w-5" />}
            title="Your Node app"
            subtitle="direct SDK"
          />
        </div>

        <Connector />

        {/* SDK core */}
        <Node
          icon={<Boxes className="h-5 w-5" />}
          title="@biji/client — shared SDK"
          subtitle="JWT auto-refresh · dual-mode SSE · ~117 endpoints"
          highlight
        />

        <Connector />

        {/* biji hosts */}
        <div className="rounded-xl border border-border bg-card p-5 text-center shadow-sm">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
            <Cloud className="h-4 w-4 text-muted-foreground" /> biji.com hosts
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["NOTES_API", "LEGACY_API", "OPEN_API", "YODA_API"].map((h) => (
              <span
                key={h}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-xs text-muted-foreground"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* queue sidecar */}
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
          <Database className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">@biji/queue</span> — a
            shared SQLite daemon backs batch jobs for both the CLI and the MCP
            server.
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
