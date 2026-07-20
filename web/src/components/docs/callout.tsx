import type { ReactNode } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  OctagonAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Variant = "note" | "info" | "tip" | "warning" | "check" | "danger"

const styles: Record<
  Variant,
  { icon: typeof Info; className: string; iconClass: string }
> = {
  note: {
    icon: Info,
    className: "border-border bg-muted/40",
    iconClass: "text-muted-foreground",
  },
  info: {
    icon: Info,
    className: "border-sky-500/25 bg-sky-500/5",
    iconClass: "text-sky-500",
  },
  tip: {
    icon: Lightbulb,
    className: "border-emerald-500/25 bg-emerald-500/5",
    iconClass: "text-emerald-500",
  },
  check: {
    icon: CheckCircle2,
    className: "border-emerald-500/25 bg-emerald-500/5",
    iconClass: "text-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/5",
    iconClass: "text-amber-500",
  },
  danger: {
    icon: OctagonAlert,
    className: "border-red-500/30 bg-red-500/5",
    iconClass: "text-red-500",
  },
}

export function Callout({
  variant = "note",
  children,
}: {
  variant?: Variant
  children: ReactNode
}) {
  const { icon: Icon, className, iconClass } = styles[variant]
  return (
    <div
      className={cn(
        "my-5 flex gap-3 rounded-xl border p-4 text-sm [&>div>*:first-child]:mt-0 [&>div>*:last-child]:mb-0 [&>div]:leading-relaxed",
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} />
      <div className="min-w-0 text-foreground/85">{children}</div>
    </div>
  )
}
