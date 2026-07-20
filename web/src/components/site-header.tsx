import { Link, NavLink } from "react-router-dom"
import { Github, Menu, Search } from "lucide-react"
import { Logo } from "./logo"
import { ModeToggle } from "./theme/mode-toggle"
import { navLinks, site } from "@/lib/site"
import { cn } from "@/lib/utils"

export function SiteHeader({
  onOpenSearch,
  onToggleSidebar,
}: {
  onOpenSearch?: () => void
  onToggleSidebar?: () => void
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Open navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Logo />

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.href}
              to={l.href}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-foreground",
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="hidden items-center gap-2 rounded-lg border border-border/70 bg-background/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              <Search className="h-4 w-4" />
              <span>Search docs</span>
              <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          )}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search docs"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:text-foreground sm:hidden"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub repository"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Github className="h-[1.15rem] w-[1.15rem]" />
          </a>
          <ModeToggle />
          <Link
            to="/docs/quickstart"
            className="ml-1 hidden rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_-6px_rgba(16,185,129,0.6)] transition hover:brightness-110 sm:inline-flex"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
