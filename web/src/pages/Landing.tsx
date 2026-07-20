import { SiteHeader } from "@/components/site-header"

// Placeholder — replaced by the full landing composition.
export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Landing coming up…</p>
      </main>
    </div>
  )
}
