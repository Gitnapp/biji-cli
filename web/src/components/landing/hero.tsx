import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Github, Sparkles, Terminal as TerminalIcon } from "lucide-react"
import { AuroraBackground } from "@/components/aceternity/aurora-background"
import { Spotlight } from "@/components/aceternity/spotlight"
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect"
import { Terminal, Line, Out, Cmd, Flag } from "@/components/terminal"
import { CopyButton } from "@/components/copy-button"
import { site } from "@/lib/site"

const INSTALL = "git clone https://github.com/Gitnapp/get-biji-api && pnpm install"

export function Hero() {
  return (
    <AuroraBackground className="min-h-[92vh] w-full overflow-hidden pb-20 pt-28">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="hsl(158 79% 48%)"
      />
      {/* faint grid floor */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45vh] bg-grid mask-b-faded opacity-[0.35] [transform:perspective(900px)_rotateX(60deg)] [transform-origin:bottom]" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        <motion.a
          href={site.repo}
          target="_blank"
          rel="noreferrer noopener"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Unofficial toolkit for Get笔记 · SDK · CLI · MCP
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-7 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl sm:leading-[1.05]"
        >
          Automate{" "}
          <span className="text-gradient">Get笔记</span> from your
          terminal, your code, and Claude.
        </motion.h1>

        <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          <TextGenerateEffect
            words={`A shared TypeScript SDK, a full-featured CLI, and an MCP server for biji.com — ${site.stats.endpoints} endpoints, ${site.stats.mcpTools} MCP tools, streaming, and a background queue.`}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            to="/docs/quickstart"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 text-[0.95rem] font-medium text-white shadow-[0_0_28px_-6px_rgba(16,185,129,0.7)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Get started <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background/50 px-6 text-[0.95rem] font-medium text-foreground backdrop-blur transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Github className="h-4 w-4" aria-hidden /> View on GitHub
          </a>
        </motion.div>

        {/* install command pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-6 flex w-full max-w-xl items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-4 py-3 font-mono text-sm text-muted-foreground backdrop-blur"
        >
          <TerminalIcon className="h-4 w-4 shrink-0 text-primary" />
          <code className="min-w-0 flex-1 truncate text-left text-foreground/90">
            {INSTALL}
          </code>
          <CopyButton value={INSTALL} />
        </motion.div>
      </div>

      {/* floating terminal preview */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="relative z-10 mx-auto mt-16 w-full max-w-3xl px-4 sm:px-6"
      >
        <Terminal title="biji — zsh">
          <Line>
            biji <Cmd>write</Cmd> "季度复盘：AI 基建的三个拐点"{" "}
            <Flag>--topic strategy</Flag>
          </Line>
          <Out>✓ note created · prime_id mp9c…3kf · filed to 知识库 “strategy”</Out>
          <div className="h-2" />
          <Line>
            biji <Cmd>link</Cmd> https://example.com/essay <Flag>-p "三句话总结"</Flag>
          </Line>
          <Out>⣾ parsing article… streaming AI note…</Out>
          <div className="h-2" />
          <Line>
            biji <Cmd>chat</Cmd> "总结我这周关于 AI 投资的笔记"
          </Line>
          <Out>Yoda ⟶ RAG over 42 notes · 本周你的 AI 投资笔记聚焦三条主线…</Out>
        </Terminal>
      </motion.div>
    </AuroraBackground>
  )
}
