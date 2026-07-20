import { useEffect, useState } from "react"
import { List } from "lucide-react"
import { useToc } from "./toc-context"
import { cn } from "@/lib/utils"

export function DocsToc() {
  const { headings } = useToc()
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: "0% 0% -75% 0%", threshold: 1 },
    )
    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 flex items-center gap-2 font-medium text-foreground">
        <List className="h-4 w-4 text-muted-foreground" /> On this page
      </p>
      <ul className="space-y-2 border-l border-border">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: (h.level - 2) * 12 }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })
                history.replaceState(null, "", `#${h.id}`)
              }}
              className={cn(
                "-ml-px block border-l border-transparent pl-4 text-muted-foreground transition-colors hover:text-foreground",
                active === h.id && "border-primary font-medium text-primary",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
