import {
  Children,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

/* ---------------- Card / CardGroup ---------------- */

export function CardGroup({
  cols = 2,
  children,
}: {
  cols?: number
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "my-6 grid grid-cols-1 gap-4",
        cols === 2 && "sm:grid-cols-2",
        cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {children}
    </div>
  )
}

export function Card({
  title,
  icon,
  href,
  children,
}: {
  title: string
  icon?: ReactNode
  href?: string
  children?: ReactNode
}) {
  const external = href?.startsWith("http")
  const inner = (
    <div className="group relative h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="font-semibold tracking-tight text-foreground">{title}</h3>
        {href && (
          <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
        )}
      </div>
      {children && (
        <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  )
  if (!href) return inner
  if (external)
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className="no-underline">
        {inner}
      </a>
    )
  return (
    <Link to={href} className="no-underline">
      {inner}
    </Link>
  )
}

/* ---------------- Steps ---------------- */

export function Steps({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement)
  return (
    <div className="my-6 ml-3 border-l border-border pl-6">
      {items.map((child, i) => (
        <div key={i} className="relative pb-6 last:pb-0">
          <span className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-background text-xs font-semibold text-primary">
            {i + 1}
          </span>
          {child}
        </div>
      ))}
    </div>
  )
}

export function Step({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      {title && (
        <h4 className="mb-2 mt-0 font-semibold text-foreground">{title}</h4>
      )}
      {children}
    </div>
  )
}

/* ---------------- Tabs ---------------- */

interface TabProps {
  title: string
  children: ReactNode
}

export function Tab({ children }: TabProps) {
  return <>{children}</>
}

export function Tabs({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(
    (c): c is ReactElement<TabProps> => isValidElement(c),
  )
  const [active, setActive] = useState(0)
  if (items.length === 0) return null
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border">
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-1"
      >
        {items.map((it, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active === i
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {it.props.title}
          </button>
        ))}
      </div>
      <div className="p-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {items[active]}
      </div>
    </div>
  )
}

/** CodeGroup — stacked container for related code blocks. */
export function CodeGroup({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 space-y-2 rounded-xl border border-border bg-muted/20 p-2">
      {children}
    </div>
  )
}

/* ---------------- ParamField / ResponseField ---------------- */

export function ParamField({
  path,
  query,
  body,
  name,
  type,
  required,
  default: def,
  children,
}: {
  path?: string
  query?: string
  body?: string
  name?: string
  type?: string
  required?: boolean
  default?: string
  children?: ReactNode
}) {
  const label = path ?? query ?? body ?? name
  return (
    <div className="my-3 rounded-lg border border-border bg-card/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {label && (
          <code className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 font-mono text-[0.8rem] font-semibold text-foreground">
            {label}
          </code>
        )}
        {type && (
          <span className="font-mono text-xs text-muted-foreground">{type}</span>
        )}
        {required && (
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-500">
            required
          </span>
        )}
        {def !== undefined && (
          <span className="text-xs text-muted-foreground">
            default: <code className="font-mono">{def}</code>
          </span>
        )}
      </div>
      {children && (
        <div className="mt-2 text-sm leading-relaxed text-muted-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {children}
        </div>
      )}
    </div>
  )
}

export const ResponseField = ParamField
