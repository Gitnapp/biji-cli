# Design Spec — get-biji-connector Landing Page + Docs Site

**Date:** 2026-07-20
**Status:** Approved (architecture confirmed via clarifying questions)
**Branch:** `claude/landing-docs-site`

## Goal

Ship a marketing **landing page** and a **documentation site** for `get-biji-connector` — the
unofficial client suite (SDK + CLI + MCP server + queue) for **biji.com (Get笔记)**.
Stack: **Vite + React + TypeScript + Tailwind CSS + shadcn/ui + Aceternity UI**, with docs
authored in the **Mintlify content model** (MDX + `docs.json`-style nav). Push to GitHub, then
deploy to **Fly.io**.

## Confirmed decisions

| Decision | Choice | Rationale |
|---|---|---|
| Docs hosting | **Everything on one Fly.io app.** Single Vite SPA: `/` landing + `/docs/*` docs. | User chose single deploy. Mintlify has no clean static self-host, so we use Mintlify's *content model* (MDX + nav config + Mintlify-style components) with our own renderer. |
| Fly region | `nrt` (Tokyo) | Closest stable Fly region to the China/Asia audience of Get笔记. |
| Theme | Dark default (aurora/spotlight) + full light-mode toggle | Aceternity shines dark; light mode shared across landing + docs. |

## Architecture

Single **standalone** package `web/` (NOT in the pnpm workspace — workspace only globs
`apps/*`/`packages/*` — so the Docker build context stays minimal with its own lockfile).

```
web/
├── src/
│   ├── main.tsx                 # entry, ThemeProvider + RouterProvider
│   ├── router.tsx               # react-router routes
│   ├── index.css                # Tailwind + shadcn CSS vars (light/dark)
│   ├── lib/
│   │   ├── utils.ts             # cn()
│   │   └── docs-nav.ts          # Mintlify docs.json-style nav config
│   ├── components/
│   │   ├── ui/                  # shadcn primitives
│   │   ├── aceternity/          # vendored Aceternity components
│   │   ├── theme/               # ThemeProvider, ModeToggle
│   │   ├── landing/             # landing sections
│   │   └── docs/                # DocsLayout, Sidebar, TOC, MDX components, search
│   ├── pages/
│   │   ├── Landing.tsx
│   │   └── docs/                # DocsLayout route + MDX pages resolver
│   └── content/docs/**.mdx      # Mintlify-style MDX docs
├── index.html
├── vite.config.ts               # react + mdx (remark-gfm, rehype-slug/autolink, shiki dual-theme)
├── tailwind.config.ts           # v3.4 + tailwindcss-animate + typography + Aceternity keyframes
├── components.json              # shadcn config
├── Dockerfile                   # multi-stage: node build → nginx serve
├── nginx.conf                   # SPA fallback, gzip, cache + security headers
├── .dockerignore
└── package.json
```

### Rendering & routing
- **react-router v6**. `/` → `Landing`. `/docs` → redirect to `/docs/introduction`.
  `/docs/*` → `DocsLayout` (sidebar + content + right TOC).
- **MDX** compiled at build time via `@mdx-js/rollup`. Each `.mdx` is a React component.
  A `import.meta.glob` map resolves the slug → MDX module for the docs router.
- **Syntax highlighting**: `@shikijs/rehype` with dual themes (`github-light` / `github-dark`)
  so code blocks follow the theme toggle via CSS variables.

### Design system
- Tailwind v3.4, shadcn CSS-variable tokens (`--background`, `--foreground`, `--primary`, …),
  dark mode via `class` strategy. Brand accent: **emerald → cyan** gradient (dev-tool feel).
- Typography via `@tailwindcss/typography` (`prose` for docs).
- Motion via `framer-motion`. Aceternity components vendored (not a package):
  Aurora Background, Spotlight, Background Beams, Bento Grid, Text Generate Effect,
  Animated Tooltip, Card Hover effects.

### Docs = Mintlify content model
- Nav defined in `docs-nav.ts` mirroring Mintlify `docs.json` (`navigation.groups[].pages[]`).
- Mintlify-style MDX components implemented locally: `<Card>`, `<CardGroup>`, `<Note>`,
  `<Warning>`, `<Tip>`, `<Info>`, `<Check>`, `<Steps>/<Step>`, `<Tabs>/<Tab>`,
  `<CodeGroup>`, `<Accordion>/<AccordionGroup>`, `<ParamField>`, `<ResponseField>`.
- Frontmatter: `title`, `description` (Mintlify-compatible) — used for page header + `<title>`.

## Content plan

**Landing sections:** sticky nav (logo, links, GitHub, theme toggle) → aurora/spotlight hero
(tagline: "The unofficial Get笔记 toolkit — SDK · CLI · MCP") → stat row (117 endpoints ·
81 MCP tools · 4 packages) → feature bento (SDK / CLI / MCP / Queue) → CLI showcase (terminal
with real `biji` commands) → MCP + Claude section → SDK code example → architecture diagram →
CTA → footer.

**Docs pages (Mintlify groups):**
- *Get Started*: introduction, quickstart, installation, authentication
- *CLI*: overview, notes, knowledge-base, link-ai, upload, queue, export, chat
- *MCP Server*: mcp-server
- *SDK*: sdk-client
- *Advanced*: reverse-engineering (capture), architecture

All content sourced from `README.md` / `apps/mcp/README.md` — must stay factually accurate
(command names, flags, endpoint counts, config paths like `~/.config/get-biji/`).

## Deployment
- **Dockerfile** (multi-stage): `node:20-alpine` + corepack pnpm → `pnpm install` → `pnpm build`;
  final stage `nginx:alpine` serving `/usr/share/nginx/html`.
- **nginx.conf**: `try_files $uri /index.html` (SPA), gzip, immutable cache for hashed assets,
  no-cache for `index.html`, security headers (X-Content-Type-Options, Referrer-Policy, etc.).
- **fly.toml**: `app = "get-biji-connector"`, `primary_region = "nrt"`, `internal_port = 80`,
  `force_https = true`, `auto_stop_machines`/`auto_start`, `min_machines_running = 1`
  (avoid cold starts; nginx static is tiny on shared-cpu-1x/256MB).

## Testing / verification
- **Build gate**: `pnpm --dir web build` must succeed (TS strict, no unresolved imports).
- **Smoke**: `vite preview` + Playwright — landing renders, theme toggle flips, `/docs/*`
  navigates, no console errors, code blocks highlight.
- **UI validation**: `web-design-guidelines` skill + `/code-review` workflow (a11y, responsive,
  dead links, docs-accuracy vs README) with adversarial verify; fix findings before deploy.
- **Deploy gate**: `fly deploy` succeeds; live URL returns 200 and renders landing + docs.

## Out of scope (YAGNI)
- No backend/API for the site (fully static). No i18n framework (copy is EN + zh where the
  product is zh). No CMS. No analytics beyond an optional lightweight snippet. No connecting to
  Mintlify Cloud (single-deploy decision).
