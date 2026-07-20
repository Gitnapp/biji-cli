import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal, Line, Out, Cmd, Flag } from "@/components/terminal"
import { Reveal, Section, SectionHeading } from "./primitives"

export function CliShowcase() {
  return (
    <Section id="cli" className="bg-muted/20">
      <Reveal>
        <SectionHeading
          eyebrow="The biji CLI"
          title="Your whole notebook, one command away"
          description="Markdown auto-converts to TipTap, links become AI notes, audio gets transcribed, and Yoda answers questions with RAG over everything."
        />
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-12 max-w-4xl">
        <Tabs defaultValue="notes">
          <div className="flex justify-center">
            <TabsList className="flex-wrap">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="queue">Queue</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notes">
            <Terminal title="biji · notes">
              <Line>
                biji <Cmd>write</Cmd> "今天的灵感…" <Flag>-t "标题"</Flag>
              </Line>
              <Out>✓ created · prime_id mp9c…3kf</Out>
              <div className="h-2" />
              <Line>
                biji <Cmd>search</Cmd> "商业模式" <Flag>-n 15</Flag>
              </Line>
              <Out>15 matches · ranked by relevance</Out>
              <div className="h-2" />
              <Line>
                biji <Cmd>edit</Cmd> mp9c3kf <Flag># opens $EDITOR</Flag>
              </Line>
              <Line>
                biji <Cmd>rm</Cmd> mp9c3kf <Flag># → recent deleted</Flag>
              </Line>
            </Terminal>
          </TabsContent>

          <TabsContent value="kb">
            <Terminal title="biji · knowledge base">
              <Line>
                biji <Cmd>kb list</Cmd>
              </Line>
              <Out>strategy · reading-2026 · podcasts …</Out>
              <div className="h-2" />
              <Line>
                biji <Cmd>kb add</Cmd> strategy <Flag>-f review.md</Flag>
              </Line>
              <Line>
                biji <Cmd>kb link</Cmd> strategy https://… <Flag>-p "AI 提示词"</Flag>
              </Line>
              <Line>
                biji <Cmd>kb move</Cmd> inbox strategy mp9c3kf
              </Line>
              <Out>moved 1 note between 知识库</Out>
            </Terminal>
          </TabsContent>

          <TabsContent value="media">
            <Terminal title="biji · media upload">
              <Line>
                biji <Cmd>upload</Cmd> podcast.mp3 <Flag>--topic podcasts</Flag>
              </Line>
              <Out>↑ OSS presign → PUT bytes → AI ASR + structured note</Out>
              <div className="h-2" />
              <Line>
                biji <Cmd>upload</Cmd> clip.mp4 <Flag>--duration 180000</Flag>
              </Line>
              <Out>✓ transcribed · note filed</Out>
              <div className="h-2" />
              <Line>
                biji <Cmd>export</Cmd> mp9c3kf <Flag>-t pdf --wait</Flag>
              </Line>
              <Out>access_url https://oss…/note.pdf</Out>
            </Terminal>
          </TabsContent>

          <TabsContent value="queue">
            <Terminal title="biji · queue">
              <Line>
                biji <Cmd>queue add</Cmd> <Flag>-f urls.txt --topic reading --batch q2</Flag>
              </Line>
              <Out>queued 100 jobs · worker forked (concurrency 3)</Out>
              <div className="h-2" />
              <Line>
                biji <Cmd>queue status</Cmd>
              </Line>
              <Out>worker: alive · pending 61 · running 3 · done 34 · failed 2</Out>
              <div className="h-2" />
              <Line>
                biji <Cmd>queue retry</Cmd> <Flag>--all-failed</Flag>
              </Line>
              <Out>re-queued 2 failed jobs</Out>
            </Terminal>
          </TabsContent>

          <TabsContent value="chat">
            <Terminal title="biji · yoda chat">
              <Line>
                biji <Cmd>chat</Cmd> "总结商业相关笔记"
              </Line>
              <Out>Yoda ⟶ RAG over your notes · streaming…</Out>
              <div className="h-2" />
              <Line>
                biji <Cmd>chat</Cmd> <Flag>-s sess_18 "再展开 AI 投资"</Flag>
              </Line>
              <Line>
                biji <Cmd>chat</Cmd> <Flag>--web "对比最新宏观数据"</Flag>
              </Line>
              <Out>notes RAG + web search combined</Out>
            </Terminal>
          </TabsContent>
        </Tabs>
      </Reveal>
    </Section>
  )
}
