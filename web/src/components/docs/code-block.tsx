import { useEffect, useRef, useState } from "react"
import { CopyButton } from "@/components/copy-button"

/** Wraps shiki-highlighted <pre> with a hover copy button. */
export function Pre(props: React.HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null)
  const [value, setValue] = useState("")

  useEffect(() => {
    if (ref.current) setValue(ref.current.textContent ?? "")
  }, [])

  return (
    <div className="group relative my-5">
      <pre ref={ref} {...props} />
      <div className="absolute right-2.5 top-2.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <CopyButton value={value} />
      </div>
    </div>
  )
}
