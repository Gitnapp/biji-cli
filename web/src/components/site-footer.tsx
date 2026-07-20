import { Link } from "react-router-dom"
import { Github } from "lucide-react"
import { LogoMark } from "./logo"
import { site } from "@/lib/site"

const cols = [
  {
    title: "Documentation",
    links: [
      { label: "Introduction", to: "/docs/introduction" },
      { label: "Quickstart", to: "/docs/quickstart" },
      { label: "Authentication", to: "/docs/authentication" },
      { label: "Architecture", to: "/docs/architecture" },
    ],
  },
  {
    title: "CLI",
    links: [
      { label: "Notes", to: "/docs/cli/notes" },
      { label: "Knowledge Base", to: "/docs/cli/knowledge-base" },
      { label: "Batch Queue", to: "/docs/cli/queue" },
      { label: "Yoda Chat", to: "/docs/cli/chat" },
    ],
  },
  {
    title: "Integrations",
    links: [
      { label: "MCP Server", to: "/docs/mcp-server" },
      { label: "SDK", to: "/docs/sdk" },
      { label: "Reverse Engineering", to: "/docs/reverse-engineering" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-semibold tracking-tight">get-biji-api</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {site.tagline} — SDK · CLI · MCP for biji.com (Get笔记).
            </p>
            <a
              href={site.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" /> Gitnapp/get-biji-api
            </a>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            Unofficial, community-built client suite. Not affiliated with or
            endorsed by biji.com / 得到 / 罗辑思维.
          </p>
          <p>MIT Licensed · Built with Vite · React · Tailwind · shadcn · Aceternity</p>
        </div>
      </div>
    </footer>
  )
}
