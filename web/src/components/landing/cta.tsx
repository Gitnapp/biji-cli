import { Link } from "react-router-dom"
import { ArrowRight, Github } from "lucide-react"
import { Spotlight } from "@/components/aceternity/spotlight"
import { Reveal, Section } from "./primitives"
import { site } from "@/lib/site"

export function Cta() {
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-emerald-500/10 via-card to-cyan-500/10 px-6 py-16 text-center sm:px-16">
          <Spotlight className="-top-40 left-1/2 -translate-x-1/2" fill="hsl(158 79% 48%)" />
          <div className="absolute inset-0 bg-dot opacity-30" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Start automating your Get笔记 today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Clone the repo, log in once, and script your notebook from the
              terminal, your code, or Claude.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/docs/quickstart"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 text-[0.95rem] font-medium text-white shadow-[0_0_28px_-6px_rgba(16,185,129,0.7)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Read the Quickstart <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={site.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background/50 px-6 text-[0.95rem] font-medium text-foreground backdrop-blur transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Github className="h-4 w-4" aria-hidden /> Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
