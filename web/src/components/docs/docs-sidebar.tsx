import { NavLink } from "react-router-dom"
import { docsNav } from "@/lib/docs-nav"
import { cn } from "@/lib/utils"

export function DocsSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-7 pb-10">
      {docsNav.map((group) => (
        <div key={group.group}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            {group.group}
          </p>
          <ul className="space-y-0.5">
            {group.pages.map((page) => (
              <li key={page.slug}>
                <NavLink
                  to={`/docs/${page.slug}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                      isActive &&
                        "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary",
                    )
                  }
                >
                  {page.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
