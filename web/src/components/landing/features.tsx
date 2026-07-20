import {
  Boxes,
  KeyRound,
  ListChecks,
  Radio,
  TerminalSquare,
  Workflow as WorkflowIcon,
} from "lucide-react"
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid"
import { Reveal, Section, SectionHeading } from "./primitives"

function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
      {children}
    </div>
  )
}

const SdkHeader = () => (
  <div className="flex h-full min-h-28 flex-col justify-center gap-1.5 rounded-lg border border-border/60 bg-[#0b0d10] p-4 font-mono text-xs text-zinc-400">
    <div>
      <span className="text-cyan-300">import</span> {"{"} searchNotes, yodaChatStream {"}"}{" "}
      <span className="text-cyan-300">from</span>{" "}
      <span className="text-emerald-300">"@biji/client"</span>
    </div>
    <div className="text-zinc-500">// JWT auto-refresh · SSE streaming · pluggable auth</div>
    <div>
      <span className="text-cyan-300">await</span> searchNotes(
      <span className="text-emerald-300">"商业"</span>, 1, 10)
    </div>
  </div>
)

const GridHeader = ({ icon }: { icon: React.ReactNode }) => (
  <div className="relative flex h-full min-h-28 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10">
    <div className="absolute inset-0 bg-dot opacity-40" />
    <div className="relative scale-[1.6] text-primary/80">{icon}</div>
  </div>
)

export function Features() {
  return (
    <Section id="features">
      <Reveal>
        <SectionHeading
          eyebrow="One toolkit, three surfaces"
          title="Everything you need to script Get笔记"
          description="A shared SDK powers a terminal CLI, an MCP server for Claude, and a background queue — so the same auth, streaming, and endpoint layer is everywhere."
        />
      </Reveal>

      <Reveal delay={0.1} className="mt-14">
        <BentoGrid>
          <BentoGridItem
            className="md:col-span-2"
            header={<SdkHeader />}
            icon={
              <IconTile>
                <Boxes className="h-5 w-5" />
              </IconTile>
            }
            title="@biji/client — the shared SDK"
            description="~117 reverse-engineered endpoints behind one typed HTTP layer, with JWT auto-refresh and dual-mode SSE streaming that works blocking or chunk-by-chunk."
          />
          <BentoGridItem
            header={<GridHeader icon={<TerminalSquare className="h-8 w-8" />} />}
            icon={
              <IconTile>
                <TerminalSquare className="h-5 w-5" />
              </IconTile>
            }
            title="@biji/cli — the terminal client"
            description="write · search · edit · link · kb · upload · export · chat — your whole notebook from biji."
          />
          <BentoGridItem
            header={<GridHeader icon={<WorkflowIcon className="h-8 w-8" />} />}
            icon={
              <IconTile>
                <WorkflowIcon className="h-5 w-5" />
              </IconTile>
            }
            title="@biji/mcp — for Claude"
            description="A stdio MCP server exposing ~81 tools so Claude Desktop and Claude Code can read and write your notes."
          />
          <BentoGridItem
            header={<GridHeader icon={<ListChecks className="h-8 w-8" />} />}
            icon={
              <IconTile>
                <ListChecks className="h-5 w-5" />
              </IconTile>
            }
            title="@biji/queue — batch daemon"
            description="A SQLite-backed background worker for bulk link parsing and uploads, with dedup, retries, and backoff."
          />
          <BentoGridItem
            header={<GridHeader icon={<Radio className="h-8 w-8" />} />}
            icon={
              <IconTile>
                <Radio className="h-5 w-5" />
              </IconTile>
            }
            title="Streaming, dual-mode"
            description="One requestSSE primitive streams to the CLI chunk-by-chunk and returns full text to the MCP server."
          />
          <BentoGridItem
            header={<GridHeader icon={<KeyRound className="h-8 w-8" />} />}
            icon={
              <IconTile>
                <KeyRound className="h-5 w-5" />
              </IconTile>
            }
            title="Pluggable auth storage"
            description="FileAuthStorage on the desktop, MemoryAuthStorage on servers, or inject your own (e.g. Redis) for multi-tenant deploys."
          />
        </BentoGrid>
      </Reveal>
    </Section>
  )
}
