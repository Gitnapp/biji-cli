import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Aceternity UI — Bento Grid. */
export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-6xl grid-cols-1 gap-4 md:auto-rows-[19rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string
  title?: ReactNode
  description?: ReactNode
  header?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:border-primary/40 hover:shadow-[0_0_40px_-12px_hsl(var(--primary)/0.35)]",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-1">
        {icon}
        <div className="mb-1 mt-3 font-semibold tracking-tight text-foreground">
          {title}
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </div>
      </div>
    </div>
  )
}
