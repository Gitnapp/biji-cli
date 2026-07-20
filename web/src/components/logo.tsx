import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10",
        className,
      )}
    >
      <svg viewBox="0 0 64 64" className="h-5 w-5" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path
          d="M20 44 V22 a2 2 0 0 1 2-2 h14 l8 8 v16 a2 2 0 0 1-2 2 H22 a2 2 0 0 1-2-2 Z"
          fill="none"
          stroke="url(#logo-g)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M36 20 v8 h8"
          fill="none"
          stroke="url(#logo-g)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M26 33 h12 M26 39 h9"
          stroke="url(#logo-g)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex items-center gap-2.5 font-semibold tracking-tight",
        className,
      )}
    >
      <LogoMark />
      <span className="text-[15px]">
        get-biji<span className="text-primary">-api</span>
      </span>
    </Link>
  )
}
