import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { CopyButton } from "./copy-button"

export function Terminal({
  title = "zsh",
  className,
  children,
  copyValue,
}: {
  title?: string
  className?: string
  children: ReactNode
  copyValue?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-[#0b0d10] shadow-2xl shadow-black/40 ring-1 ring-white/5",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-zinc-500">{title}</span>
        {copyValue && (
          <div className="ml-auto">
            <CopyButton value={copyValue} className="border-white/10 bg-white/5" />
          </div>
        )}
      </div>
      <div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-zinc-300">
        {children}
      </div>
    </div>
  )
}

export function Line({
  prompt = true,
  comment = false,
  children,
}: {
  prompt?: boolean
  comment?: boolean
  children: ReactNode
}) {
  if (comment) {
    return <div className="text-zinc-500"># {children}</div>
  }
  return (
    <div className="whitespace-pre">
      {prompt && <span className="select-none text-emerald-400">$ </span>}
      {children}
    </div>
  )
}

export function Out({ children }: { children: ReactNode }) {
  return <div className="whitespace-pre text-zinc-500">{children}</div>
}

/** Highlight a subcommand token in brand color. */
export function Cmd({ children }: { children: ReactNode }) {
  return <span className="text-cyan-300">{children}</span>
}

export function Flag({ children }: { children: ReactNode }) {
  return <span className="text-zinc-500">{children}</span>
}
