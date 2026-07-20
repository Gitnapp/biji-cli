import { Reveal } from "./primitives"
import { site } from "@/lib/site"

const items = [
  { value: site.stats.endpoints + "+", label: "Reverse-engineered endpoints" },
  { value: site.stats.mcpTools, label: "MCP tools for Claude" },
  { value: site.stats.packages, label: "Composable packages" },
  { value: "MIT", label: "Open-source license" },
]

export function Stats() {
  return (
    <section className="border-y border-border/70 bg-muted/20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 md:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 0.06}>
            <div className="px-2 py-10 text-center">
              <div className="text-4xl font-bold tracking-tight text-gradient tabular-nums sm:text-5xl">
                {it.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{it.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
