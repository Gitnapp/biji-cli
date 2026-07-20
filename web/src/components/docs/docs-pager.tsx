import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getPrevNext } from "@/lib/docs-nav"

export function DocsPager({ slug }: { slug: string }) {
  const { prev, next } = getPrevNext(slug)
  if (!prev && !next) return null
  return (
    <div className="mt-14 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          to={`/docs/${prev.slug}`}
          className="group flex flex-col rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </span>
          <span className="mt-1 font-medium text-foreground group-hover:text-primary">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next && (
        <Link
          to={`/docs/${next.slug}`}
          className="group flex flex-col items-end rounded-xl border border-border p-4 text-right transition-colors hover:border-primary/40 hover:bg-accent/40"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Next <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="mt-1 font-medium text-foreground group-hover:text-primary">
            {next.title}
          </span>
        </Link>
      )}
    </div>
  )
}
