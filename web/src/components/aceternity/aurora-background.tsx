import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode
  showRadialGradient?: boolean
}

/**
 * Aceternity UI — Aurora Background.
 * Emerald/teal/cyan aurora tuned for get-biji-api's brand, theme-aware
 * (white-gradient + invert in light, dark-gradient in dark).
 */
export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center bg-background text-foreground",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          className={cn(
            `pointer-events-none absolute -inset-[10px] opacity-40 blur-[10px] will-change-transform [background-image:var(--white-gradient),var(--aurora)] [background-position:50%_50%,50%_50%] [background-size:300%,_200%] [--aurora:repeating-linear-gradient(100deg,#10b981_10%,#2dd4bf_15%,#22d3ee_20%,#34d399_25%,#06b6d4_30%)] [--dark-gradient:repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)] [--white-gradient:repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)] [filter:blur(10px)_invert(1)] after:absolute after:inset-0 after:animate-aurora after:mix-blend-difference after:content-[""] after:[background-attachment:fixed] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] dark:opacity-50 dark:[background-image:var(--dark-gradient),var(--aurora)] dark:[filter:blur(10px)_invert(0)] dark:after:[background-image:var(--dark-gradient),var(--aurora)]`,
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]",
          )}
        />
      </div>
      {children}
    </div>
  )
}
