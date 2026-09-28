# biji-cli

biji.com (Get笔记) 客户端套件 monorepo —— 共享 SDK + CLI + MCP server。

## 结构

```
.
├── apps/
│   ├── cli/            @gitnapp/biji-cli     终端命令行 (biji)；src/commands/* 每个子命令一个文件
│   ├── mcp/            @gitnapp/biji-mcp     stdio MCP server；src/tools/* 按领域分组的 100 个工具
│   └── bin/            @gitnapp/biji-bin     单文件可执行入口（private）：CLI + `biji mcp` + 队列 worker
├── packages/
│   ├── biji-client/    @gitnapp/biji-client  SDK：client.ts (HTTP/SSE) · auth.ts · api.ts (~117 端点)
│   │                                         · flows.ts (跨端复用的业务流程) · markdown.ts (md → TipTap)
│   └── biji-queue/     @gitnapp/biji-queue   本地 SQLite 队列 + 后台 worker
├── scripts/build-bin.mjs  用 bun 把 apps/bin 编译成各平台单文件二进制
├── scripts/capture/    抓包脚本（不在 workspace 内，仅开发用）
├── Dockerfile · compose.yaml · .dockerignore
└── pnpm-workspace.yaml · tsconfig.base.json
```

分层规则：`api.ts` 只放一对一的端点函数；需要多步组合的操作（媒体上传三步、KB 别名解析、note_id → resource_id 映射、markdown 建笔记、链接解析摘要）统一放在 `flows.ts`，CLI / MCP / queue 三端都直接调用它，不各自复制一份。`@gitnapp/biji-cli`、`@gitnapp/biji-mcp`、`@gitnapp/biji-queue` 都通过 `workspace:*` 引用 `@gitnapp/biji-client`。新端点都从浏览器抓包逆向得到（见下文「逆向新端点」）。

## 安装与构建

需要 `pnpm@10+` 和 `node@22.13+`（队列用内置的 `node:sqlite`；只用 `@gitnapp/biji-client` SDK 的话 Node 18 即可）。

```bash
pnpm install
pnpm -r build          # 拓扑顺序：先 client，再 cli/mcp
```

开发模式（任意一端独立监听）：

```bash
pnpm dev:cli           # tsx watch apps/cli/src/cli.ts
pnpm dev:mcp           # tsx watch apps/mcp/src/index.ts
```

### 单文件二进制

不想装 Node 的话，可以把 CLI、MCP server、队列 worker 一起编译成一个可执行文件（基于 `bun build --compile`，bun 作为 devDependency 自动安装）：

```bash
pnpm build:bin         # 当前平台 → release/biji-<os>-<arch>
pnpm build:bin:all     # linux-x64/arm64 · darwin-x64/arm64 · windows-x64（交叉编译）
node scripts/build-bin.mjs linux-arm64 darwin-arm64   # 指定目标（需先 pnpm -r build）
```

产物约 60–85MB，无任何运行时依赖。用法：

```bash
./biji-linux-x64 search "关键词"     # 等价于 biji CLI
./biji-linux-x64 mcp                 # stdio MCP server（等价于 biji-mcp）
./biji-linux-x64 setup add claude-code   # 注册成 { command: <二进制绝对路径>, args: ["mcp"] }
```

队列 worker 由二进制以隐藏子命令 `__queue-worker` 自行拉起，不需要额外文件。

## CLI 用法

构建后通过 `node apps/cli/dist/cli.js <command>` 调用，或将其链接为 `biji`：

```bash
npm link --workspace @gitnapp/biji-cli   # 然后直接用 biji
```

### 认证

biji.com 用 JWT + refresh_token，存 `~/.config/get-biji/auth.json`，refresh_token 约 90 天有效，JWT 过期前自动刷新。

```bash
biji auth login          # 引导式（粘贴浏览器导出的 JSON）
biji auth status         # 查看当前 token 状态
biji auth show           # 打印原始 auth 文件
```

也支持环境变量覆盖 `BIJI_TOKEN` / `BIJI_REFRESH_TOKEN`（适合 CI 或服务器场景）。

### 笔记操作

```bash
biji write "今天的灵感..."                  # 写笔记，markdown 自动转 TipTap
biji write -t "标题" -f path/to/file.md
echo "笔记内容" | biji write

biji search "关键词" -n 15                  # 关键词全文搜索
biji get <prime_id>                          # 拉取并打印某条笔记
biji edit <id>                               # 用 $EDITOR 编辑
biji rm <prime_id>                           # 删除笔记（进入最近删除）

biji recycle list                            # 列出最近删除（近 90 天）
biji recycle restore <prime_id...>           # 还原笔记
biji recycle delete  <prime_id...> -y        # 永久删除（不可逆）
biji recycle clear   -y                      # 清空回收站（不可逆）

biji link "https://example.com/article"     # AI 解析链接生成笔记（流式）
biji link --quiet --json <url>
biji link -p "用一句话概括" --topic <topic_id> <url>   # 自定义 prompt + 落到 KB
```

### 知识库（KB / 知识库 sidebar）

biji.com 的「知识库」对应 SDK 里的 topic 系统 —— 一组带 `root_dir` 的 topic。CLI 把 `note_id ↔ resource_id` 的映射封装好了，平时只需传 note_id。

```bash
biji kb list                                                 # 列所有 topic（带 id_alias + 计数）
biji kb resources <topicIdAlias>                             # 列 topic 内的 resource

biji kb add <topicIdAlias> "笔记内容"  -t "标题"             # 新建笔记直接进 KB
biji kb add <topicIdAlias> -f path/to/file.md                # 从 markdown 文件
echo "..." | biji kb add <topicIdAlias>                      # 从 stdin

biji kb link <topicIdAlias> <url> -p "AI 提示词"             # AI 解析链接落到 KB（流式）
biji kb attach <topicIdAlias> <noteId...>                    # 把已有笔记加入 KB
biji kb remove <topicIdAlias> <noteId...>                    # 移出 KB（笔记本身不删）
biji kb move <fromAlias> <toAlias> <noteId...>               # 在 KB 之间搬运笔记
```

### 音视频上传

biji 的上传走 3 步：拿 OSS 预签名 → PUT 原始字节 → POST 触发 AI（ASR + 结构化笔记）。CLI 一条命令封装：

```bash
biji upload podcast.mp3                                      # 默认进 "全部笔记"
biji upload clip.mp4 --topic <topicIdAlias> -p "重点摘要"   # 进 KB topic
biji upload audio.m4a --duration 180000                      # 显式传时长（ms），更稳
biji upload --kind video screen.mkv                          # 强制按视频处理
```

文件扩展名自动识别 audio/video。`--duration` 不传时默认 0，biji 服务端会自己探时长（但对短文件可能失败，建议显式传）。

### 队列任务（后台批处理）

一次提交大量 URL，本地常驻 worker 异步跑，提交即返回不阻塞。worker 第一次 `queue add` 时自动 fork 后台进程，5 分钟空闲自动退出，SIGTERM 优雅停（先做完手头的）。

存储在 `~/.config/get-biji/queue/queue.db`（SQLite），多进程读写安全；日志 append 到同目录 `worker.log`。

```bash
# 入队 100 条链接 → worker 自动后台跑（concurrency=3）
biji queue add -f urls.txt --topic some-kb --batch reading-2026q2
biji queue add https://x.com/a https://x.com/b -p "用三句话总结"

# 本地音视频批量上传
biji queue upload ./recordings/*.mp3 --topic podcasts

# 看进度（worker 在跑吗？多少 pending/done/failed）
biji queue status
biji queue list -n 30                     # 最近 30 条
biji queue list --status failed           # 只看失败
biji queue list --batch reading-2026q2    # 按批次

# 实时跟日志
biji queue logs -f

# 失败重试 / 取消 / 清理
biji queue retry --all-failed
biji queue retry mp97cz3w_no3suf mp97cz3x_3nl1kw
biji queue cancel <id...>                 # 只能取消 pending
biji queue clear                          # 删 done
biji queue clear --all                    # 删全部（含 pending/running，慎用）

# 调试 / 控制 worker
biji queue worker                         # 前台跑（debug）
biji queue stop                           # SIGTERM 后台 worker
biji queue show <id>                      # 单 job 完整 JSON
```

容错行为（数字均在 [packages/biji-queue/src/worker.ts](packages/biji-queue/src/worker.ts)）：
- 业务报错重试到 `--max-attempts`（默认 3），用尽后置 `failed`
- rate-limit (`h.c=40014`) 触发指数退避（5s → 10s → 20s … 上限 **10 min**），同样消耗一次 attempt；预期会限速的场景调大 `--max-attempts`
- 单个 job 总时长保护 **10 min**，超时算 retry-able 错误
- worker 崩溃下次启动只会把「running 且 `started_at` 早于 15 分钟前」的重置为 pending，**不会**误杀正在另一 worker 跑的活 job

去重：
- 默认按 `link:<url>` / `upload:<file>` key 完全匹配；同 key 且状态属 `pending|running|done` 的视为重复，自动跳过
- `failed` / `canceled` 状态**不**视为重复，可以直接重新提交（也可以 `biji queue retry` 原地复活）
- `--force` 跳过去重；URL 不做规范化（`?utm_source=…` 变体算不同 URL，要么手动清洗，要么用 `--force`）

### 队列任务（MCP 端）

MCP server 注册了 7 个工具，跟 CLI 共用同一个 `~/.config/get-biji/queue/queue.db` 和同一个 daemon —— Claude 在对话里一次扔 100 条 URL 进队，立刻返回，daemon 在后台跑完，Claude 不会被阻塞。daemon 跨 MCP/CLI 进程：MCP 触发 spawn 之后，关掉 Claude Desktop 也继续跑；之后 `biji queue status` / `biji queue list` 一样能查。

| 工具 | 入参 | 说明 |
|---|---|---|
| `queue_add` | `urls[]`, `topic_alias?`, `prompt?`, `batch?`, `max_attempts?`, `force?` | 入队链接 jobs，立即返回 ids；自动 spawn worker |
| `queue_upload` | `files[]`, `topic_alias?`, `prompt?`, `kind?`, `batch?`, `max_attempts?`, `force?` | 入队本地音视频 jobs |
| `queue_status` | — | 返回 worker 存活 + 各状态计数 + log 路径 |
| `queue_list` | `status?`, `limit?`, `batch?` | 列 jobs（默认 limit=20） |
| `queue_show` | `id` | 单 job 完整 JSON |
| `queue_retry` | `ids?` 或 `all_failed: true` | 重新入队 failed |
| `queue_cancel` | `ids[]` | 取消 pending |

### 导出笔记

支持 `pdf / docx / md / mp3`（mp3 仅对音频类笔记生效）。biji 的导出是异步任务：先创建，再轮询，最后从 OSS presigned URL 下载。

```bash
biji export <noteId...>                                      # 创建任务，打印 task_id
biji export <noteId...> --wait                               # 阻塞到任务完成，打印 access_url
biji export <noteId...> -t md --download /tmp/exports        # 阻塞 + 下载到目录
biji export-status <taskId>                                  # 单独查任务状态
```

### Yoda AI 聊天（语义搜索）

跟 biji 自带的 Yoda AI 对话，自动 RAG 你的全部笔记。

```bash
biji chat list                              # 列出最近会话（带答案预览）
biji chat show <session_id>                 # 看某会话完整历史
biji chat "总结商业相关笔记"                 # oneshot，复用最近会话
biji chat -n "新主题：日本加息"              # 强制新建会话
biji chat -s <session_id> "再展开 AI 投资"   # 在指定会话里追问
biji chat                                   # 进入 REPL 多轮对话
```

REPL 内：`/quit` 退出，`/reset` 清空上下文（重置 parent_id）。

可选范围控制（默认只走笔记 RAG）：

```bash
--no-notes      关闭笔记 RAG
--web           启用 web 搜索
--dedao         启用得到知识库
```

## MCP server 用法

`biji-mcp` 是 stdio MCP，注册了 ~100 个工具（笔记 / 标签 / topics / 知识库 / Yoda chat / AI 写作 / 媒体上传 / 导出 / Canvas + 7 个 queue 工具）。

### 一键接入（推荐）

`biji setup` 直接把 `get-biji` server 写进各 AI 客户端的配置文件（自动合并、先备份 `.bak`）：

```bash
biji setup add claude-code        # 也支持 claude-desktop / cursor / windsurf / cline / gemini
biji setup add cursor --npx       # 用已发布的 `npx -y @gitnapp/biji-mcp` 形式（默认用本地构建的绝对路径）
biji setup list                   # 看所有客户端的配置路径 + 是否已配置
biji setup remove claude-code     # 移除（同样先备份）

# 不在内置清单里的客户端 —— 通用逃生口（顺带打印可手动粘贴的 snippet）
biji setup add --file <config.json> --key mcpServers
```

默认写入的是「绝对 node 路径 + 本地 `apps/mcp/dist/index.js`」（对 Claude Desktop 这类不继承 shell PATH 的 GUI 应用最稳）。发布到 npm 后可改用 `--npx`，对应：

```bash
npx -y @gitnapp/biji-mcp
```

### 手动配置

`~/.config/Claude/claude_desktop_config.json`（或 Claude Code MCP 配置）：

```json
{
  "mcpServers": {
    "get-biji": {
      "command": "npx",
      "args": ["-y", "@gitnapp/biji-mcp"]
    }
  }
}
```

确保 `~/.config/get-biji/auth.json` 已就绪（先在 CLI 跑 `biji auth login` 即可）。

## 诊断与自助文档

```bash
biji doctor                # 一屏体检：Node 版本 / MCP 构建 / auth 有效性 + 活体探测 / auth 文件权限 / queue / 已接入的 MCP 客户端
biji doctor --offline      # 跳过对 biji.com 的活体请求
biji doctor --json         # 机器可读；任一 ✗ 检查则 exit 1（适合 CI / 脚本）

biji --ai                  # 打印面向 AI agent 的精简用法手册（等价 `biji ai`），让助手一次读懂全部命令
```

## Docker

一个镜像同时提供 `biji` 和 `biji-mcp` 两个命令，基于 `node:22-bookworm-slim`（队列用内置 `node:sqlite`，无原生模块）。运行状态（auth.json、队列数据库）统一挂在 `/root/.config/get-biji`，本地文件通过 `/work` 挂载进去。

```bash
docker build -t biji .
# 宿主机开着 Clash/mihomo 等 TUN 代理（fake-ip 模式，域名解析成 198.18.x.x）时，
# 容器走 bridge 网络连不上 npm，构建会卡在 corepack/pnpm install —— 改用宿主网络：
docker build --network=host -t biji .

# CLI：先登录（auth 落到 named volume）
docker run -it --rm -v biji-config:/root/.config/get-biji biji biji auth login
docker run --rm -v biji-config:/root/.config/get-biji biji biji search "关键词"
docker run --rm -v biji-config:/root/.config/get-biji -v "$PWD":/work biji biji upload podcast.mp3

# MCP server（stdio，需要 -i）
docker run -i --rm -v biji-config:/root/.config/get-biji -v "$PWD":/work biji biji-mcp
```

MCP 客户端配置里把 `command` 写成 `docker`、`args` 写成上面那串参数即可。

`compose.yaml` 里有两个服务：`mcp`（`docker compose run --rm mcp biji <cmd>`）和 `worker`。后者是队列的专用常驻进程：容器里 `biji queue add` fork 出来的 worker 会随 PID 1 一起退出，所以必须单独跑一个服务；它空闲 5 分钟自动退出，由 compose 的 `restart: unless-stopped` 拉起。另外 PID 文件不跨容器，从别的容器跑 `biji queue status` 会显示 worker「not running」，这是预期行为。

## 发布到 npm

四个包都可发布（`publishConfig.access=public` 已设）。注意几个前提，否则 `npx @gitnapp/biji-mcp` 装不起来：

1. **scope 归属**：四个包都在 npm 用户 `gitnapp` 的个人 scope 下（`@gitnapp/*`），需用该账号 `npm login` 后发布。未带 scope 的 `biji-cli` 已被他人占用，所以统一用个人 scope。
2. **依赖顺序**：`pnpm pack/publish` 会把 `workspace:*` 改写成当前精确版本（如 `@gitnapp/biji-client@0.1.0`），所以必须**先发依赖再发上层**：`@gitnapp/biji-client` → `@gitnapp/biji-queue` → `@gitnapp/biji-mcp` / `@gitnapp/biji-cli`。四包版本保持一致（当前都是 0.1.0），bump 时一起 re-pack 避免悬空精确 pin。
3. **Node 版本**：`@gitnapp/biji-queue` 用 Node 内置的 `node:sqlite`（无原生模块，不需要编译工具链），要求 **Node ≥22.13**。MCP server 对此做了降级——更老的 Node 上只有 7 个 queue 工具不可用，其余 ~93 个工具照常启动（见 `packages/biji-queue/src/store.ts` 的惰性加载）。

```bash
npm login
pnpm --filter @gitnapp/biji-client publish
pnpm --filter @gitnapp/biji-queue  publish
pnpm --filter @gitnapp/biji-mcp    publish
pnpm --filter @gitnapp/biji-cli    publish
# dry-run 验证打包内容（不真发）：pnpm --filter @gitnapp/biji-mcp pack
```

## @gitnapp/biji-client SDK 集成

如果你想在自己的 Node.js 工程里直接调用 biji API：

```ts
import {
  loadAuth, setAuthStorage, FileAuthStorage, MemoryAuthStorage,
  searchNotes, createNote, yodaChatStream,
} from "@gitnapp/biji-client";

// 1. 选择 auth storage（CLI/桌面用 File，HTTP server 用 Memory）
setAuthStorage(new FileAuthStorage());     // 默认就是它
loadAuth();                                 // 从文件 / env 加载 token

// 2. 调任意端点
const res = await searchNotes("商业", 1, 10);

// 3. 流式 Yoda
await yodaChatStream(
  {
    mode: "AUTO",
    notes: { select_all: true },
    web: false, dedao: false, study: false,
    topics: {}, selected_resources: [],
    parent_id: "", question: "总结一下", action: "next",
    session_id: "<existing-session-id>",
  },
  { onChunk: (text) => process.stdout.write(text) },
);
```

`AuthStorage` 可注入自己的实现（比如 Redis 多租户），适配 stdio MCP / HTTP MCP / fly.io 部署等场景。

## 逆向新端点（capture script）

biji.com 没有公开 API 文档，本仓库里的端点都是抓包反推的。`scripts/capture/` 里有一个 Playwright 脚本，用来在你操作 web 端时实时记录所有请求 + body，供后续映射成 SDK 函数。

### 首次准备

```bash
cd scripts/capture
pnpm install                # playwright
pnpm exec playwright install chromium   # 下载 ~92MB Chromium
```

### 抓包流程

```bash
# 1. 起脚本 — Chromium 弹窗，profile 持久化在 /tmp/biji-chromium-profile
node scripts/capture/capture.mjs

# 2. 在 Chromium 里登录 biji.com，导航到要观察的页面
# 3. 在另一个 terminal 里打 marker 分段日志（写到同一个 jsonl）
printf '{"kind":"marker","ts":%s,"label":"before-X"}\n' $(date +%s000) >> /tmp/biji-capture.jsonl
# … 在 web 端做一次目标操作 …
printf '{"kind":"marker","ts":%s,"label":"after-X"}\n' $(date +%s000) >> /tmp/biji-capture.jsonl

# 4. 提取这段的 POST / PUT / DELETE
awk '/"label":"before-X"/{f=1;next} /"label":"after-X"/{f=0} f' /tmp/biji-capture.jsonl \
  | grep -E '"method":"(POST|PUT|DELETE|PATCH)"' \
  | head -20

# 5. Ctrl+C 关脚本
```

请求过滤已经在脚本里写好：只记 `biji.com / trytalks.com / luojilab.com / iget.com` 四个域名的 XHR / fetch / SSE / WebSocket，跳过图片/字体/CSS 噪声。响应体 > 4KB 自动截断。

### 把抓到的端点变成 SDK 函数

观察 capture 输出的 4 个字段：

| 看 | 决定 SDK 里的 |
|------|---------------|
| URL host | 用哪个 base const（`NOTES_API` / `LEGACY_API` / `OPEN_API` / `YODA_API`） |
| URL path | 函数里的 path 字符串 |
| Method + body 形状 | 函数签名 + `request()`/`requestSSE()` 调用 |
| 关键 header（`X-Topic-Scope` / `X-Av` 等） | 传 `extraHeaders` |

历史上踩过的坑：
- 同一个端点在不同 host 上都通（`notes-api.biji.com` ↔ `get-notes.luojilab.com`）—— **以抓包里实际看到的那个为准**，否则可能因为路由策略偶发 4xx。
- `resource_id` 跟 `note_id` 不是一回事：前者是 topic 内的绑定 id（数字），后者是笔记本身的 id（字符串）。涉及 topic 的删除/移动用 `resource_id`。
- 异步任务（导出、上传 SSE、ASR）都有「先 POST 创建 → 再 GET 轮询 → 最后 OSS download」的 3-step 模式，单跑 POST 是不够的。

脚本本身 commit 到仓库，本地抓包产物（profile + jsonl）落在 `/tmp/biji-*`，不会污染工作区。`scripts/capture/node_modules/` 由顶层 `node_modules/` 规则忽略。

## 关键设计

- **流式 SSE 双形态**：`requestSSE(url, path, body, { onChunk })` 既可阻塞读全文（MCP），也可边收边吐 chunk（CLI），同一份代码两种 host。
- **Auth storage pluggable**：`AuthStorage` 接口 + `FileAuthStorage` / `MemoryAuthStorage`，未来上 fly.io 多租户写个 `RedisAuthStorage` 注入即可。
- **CommonJS + Node16 module resolution**：源码用 `import "./xxx.js"` 写法（即使源是 `.ts`），保持与 MCP/Node 双端的兼容。

## 技术栈

- TypeScript 5.9 (strict, ES2022 target, Node16 module)
- pnpm 10 workspaces
- Node 22.13+ (`fetch` / `ReadableStream` / `node:sqlite` 内置)；单文件二进制用 Bun `--compile`
- `@modelcontextprotocol/sdk` (MCP server)
- `commander` (CLI 框架)
- `zod` (MCP tool schemas)
