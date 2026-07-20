export interface DocPage {
  title: string
  slug: string
}

export interface DocGroup {
  group: string
  pages: DocPage[]
}

/** Mintlify `docs.json`-style navigation. */
export const docsNav: DocGroup[] = [
  {
    group: "Get Started",
    pages: [
      { title: "Introduction", slug: "introduction" },
      { title: "Quickstart", slug: "quickstart" },
      { title: "Installation", slug: "installation" },
      { title: "Authentication", slug: "authentication" },
    ],
  },
  {
    group: "CLI",
    pages: [
      { title: "Notes", slug: "cli/notes" },
      { title: "Knowledge Base", slug: "cli/knowledge-base" },
      { title: "AI Link Parsing", slug: "cli/link" },
      { title: "Media Upload", slug: "cli/upload" },
      { title: "Batch Queue", slug: "cli/queue" },
      { title: "Export", slug: "cli/export" },
      { title: "Yoda Chat", slug: "cli/chat" },
    ],
  },
  {
    group: "Integrations",
    pages: [
      { title: "MCP Server", slug: "mcp-server" },
      { title: "SDK · @biji/client", slug: "sdk" },
    ],
  },
  {
    group: "Advanced",
    pages: [
      { title: "Architecture", slug: "architecture" },
      { title: "Reverse Engineering", slug: "reverse-engineering" },
    ],
  },
]

export const flatDocs: DocPage[] = docsNav.flatMap((g) => g.pages)

export function findDoc(slug: string): DocPage | undefined {
  return flatDocs.find((p) => p.slug === slug)
}

export function getPrevNext(slug: string): {
  prev?: DocPage
  next?: DocPage
} {
  const idx = flatDocs.findIndex((p) => p.slug === slug)
  if (idx === -1) return {}
  return {
    prev: idx > 0 ? flatDocs[idx - 1] : undefined,
    next: idx < flatDocs.length - 1 ? flatDocs[idx + 1] : undefined,
  }
}

export function groupOf(slug: string): string | undefined {
  return docsNav.find((g) => g.pages.some((p) => p.slug === slug))?.group
}
