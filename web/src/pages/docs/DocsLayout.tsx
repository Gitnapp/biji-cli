import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { X } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { DocsSidebarNav } from "@/components/docs/docs-sidebar"
import { DocsToc } from "@/components/docs/docs-toc"
import { DocsSearch } from "@/components/docs/docs-search"
import { TocProvider } from "@/components/docs/toc-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Logo } from "@/components/logo"
import { SkipLink } from "@/components/skip-link"

export function DocsLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <TocProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SkipLink />
        <SiteHeader
          onOpenSearch={() => setSearchOpen(true)}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-16 h-[calc(100vh-4rem)] py-8">
                <ScrollArea className="h-full pr-3">
                  <DocsSidebarNav />
                </ScrollArea>
              </div>
            </aside>

            {/* Content + TOC */}
            <div className="min-w-0 xl:grid xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-10">
              <main id="main-content" className="min-w-0 py-10">
                <Outlet />
              </main>
              <aside className="hidden xl:block">
                <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-10">
                  <DocsToc />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-background p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <DocsSidebarNav onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <DocsSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </TocProvider>
  )
}
