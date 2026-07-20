import { useEffect, useState, type ComponentType } from "react"
import { Link, useParams } from "react-router-dom"
import { MDXProvider } from "@mdx-js/react"
import { mdxComponents } from "@/components/docs/mdx-components"
import { DocsPager } from "@/components/docs/docs-pager"
import { useToc, type Heading } from "@/components/docs/toc-context"
import { findDoc, groupOf } from "@/lib/docs-nav"
import { site } from "@/lib/site"

type Frontmatter = { title?: string; description?: string }
type DocModule = {
  default: ComponentType<Record<string, unknown>>
  frontmatter?: Frontmatter
}

const docModules = import.meta.glob<DocModule>("/src/content/docs/**/*.mdx")

type LoadState =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "ready"; Comp: DocModule["default"]; fm: Frontmatter }

export function DocsPage() {
  const params = useParams()
  const slug = (params["*"] || "introduction").replace(/\/$/, "")
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const { setHeadings } = useToc()

  useEffect(() => {
    let cancelled = false
    setState({ status: "loading" })
    const loader = docModules[`/src/content/docs/${slug}.mdx`]
    if (!loader) {
      setState({ status: "notfound" })
      return
    }
    loader().then((mod) => {
      if (cancelled) return
      const meta = findDoc(slug)
      setState({
        status: "ready",
        Comp: mod.default,
        fm: {
          title: mod.frontmatter?.title ?? meta?.title ?? slug,
          description: mod.frontmatter?.description,
        },
      })
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (state.status !== "ready") return
    // Set document title.
    document.title = `${state.fm.title} — ${site.name} docs`
    // Extract headings for the TOC after the MDX has rendered.
    const raf = requestAnimationFrame(() => {
      const article = document.getElementById("doc-article")
      if (!article) return
      const nodes = Array.from(
        article.querySelectorAll<HTMLElement>("h2[id], h3[id]"),
      )
      const headings: Heading[] = nodes.map((n) => ({
        id: n.id,
        text: (n.textContent || "").replace(/#\s*$/, "").trim(),
        level: n.tagName === "H2" ? 2 : 3,
      }))
      setHeadings(headings)
      // Honor deep-link hash, else scroll to top.
      if (window.location.hash) {
        document
          .getElementById(window.location.hash.slice(1))
          ?.scrollIntoView({ behavior: "auto" })
      } else {
        window.scrollTo({ top: 0 })
      }
    })
    return () => {
      cancelAnimationFrame(raf)
      setHeadings([])
    }
  }, [state, slug, setHeadings])

  if (state.status === "loading") {
    return (
      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (state.status === "notfound") {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          <code className="font-mono">/docs/{slug}</code> doesn’t exist.
        </p>
        <Link
          to="/docs/introduction"
          className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Back to Introduction
        </Link>
      </div>
    )
  }

  const { Comp, fm } = state
  const group = groupOf(slug)

  return (
    <div>
      <div className="mb-8">
        {group && (
          <p className="text-sm font-medium text-primary">{group}</p>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-tight">
          {fm.title}
        </h1>
        {fm.description && (
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            {fm.description}
          </p>
        )}
      </div>

      <article
        id="doc-article"
        className="prose prose-neutral max-w-none dark:prose-invert"
      >
        <MDXProvider components={mdxComponents}>
          <Comp />
        </MDXProvider>
      </article>

      <DocsPager slug={slug} />
    </div>
  )
}
