import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Terminal } from "@/components/terminal"
import { Reveal, Section } from "./primitives"

export function SdkSection() {
  return (
    <Section id="sdk" className="bg-muted/20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <Terminal title="example.ts">
            <pre className="whitespace-pre text-[13px] leading-relaxed">
              <span className="text-cyan-300">import</span> {"{"}
              {"\n  "}loadAuth, setAuthStorage, FileAuthStorage,
              {"\n  "}searchNotes, createNote, yodaChatStream,
              {"\n"}
              {"}"} <span className="text-cyan-300">from</span>{" "}
              <span className="text-emerald-300">"@biji/client"</span>
              {"\n\n"}
              <span className="text-zinc-500">
                {"// 1. pick an auth storage (File on desktop, Memory on servers)"}
              </span>
              {"\n"}setAuthStorage(<span className="text-cyan-300">new</span>{" "}
              FileAuthStorage())
              {"\n"}loadAuth()
              {"\n\n"}
              <span className="text-zinc-500">{"// 2. call any endpoint"}</span>
              {"\n"}
              <span className="text-cyan-300">const</span> res ={" "}
              <span className="text-cyan-300">await</span> searchNotes(
              <span className="text-emerald-300">"商业"</span>, 1, 10)
              {"\n\n"}
              <span className="text-zinc-500">{"// 3. stream Yoda AI, chunk by chunk"}</span>
              {"\n"}
              <span className="text-cyan-300">await</span> yodaChatStream(query, {"{"}
              {"\n  "}onChunk: (t) =&gt; process.stdout.write(t),
              {"\n"}
              {"}"})
            </pre>
          </Terminal>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            @biji/client
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Drop the SDK into your own code
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            The same package that powers the CLI and MCP server is a plain
            TypeScript library. Pick an auth storage, load your token, and call any
            of ~117 endpoints — with JWT refresh and SSE streaming handled for you.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Dual-mode <code className="font-mono text-foreground/80">requestSSE</code> —
              read full text or stream chunks from one call.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Injectable <code className="font-mono text-foreground/80">AuthStorage</code> —
              File, Memory, or your own Redis-backed store.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              CommonJS + Node16 resolution — friendly to both Node servers and MCP.
            </li>
          </ul>
          <Link
            to="/docs/sdk"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Read the SDK guide <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </Section>
  )
}
