import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SkipLink } from "@/components/skip-link"
import { Hero } from "@/components/landing/hero"
import { Stats } from "@/components/landing/stats"
import { Features } from "@/components/landing/features"
import { CliShowcase } from "@/components/landing/cli-showcase"
import { McpSection } from "@/components/landing/mcp-section"
import { SdkSection } from "@/components/landing/sdk-section"
import { Architecture } from "@/components/landing/architecture"
import { Cta } from "@/components/landing/cta"

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <CliShowcase />
        <McpSection />
        <SdkSection />
        <Architecture />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  )
}
