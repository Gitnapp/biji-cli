import { useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Aceternity-style Card Spotlight — a radial glow follows the cursor.
 */
export function SpotlightCard({
  children,
  className,
  radius = 350,
}: {
  children: ReactNode
  className?: string
  radius?: number
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(${radius}px circle at ${pos.x}px ${pos.y}px, hsl(var(--primary) / 0.15), transparent 70%)`,
        }}
      />
      {children}
    </div>
  )
}
