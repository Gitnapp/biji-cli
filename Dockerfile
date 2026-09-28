# ---- builder ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.31.0 --activate

# Manifests first for layer caching. Docker COPY can't glob into nested dirs
# while preserving their paths, so each package.json is copied explicitly.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/cli/package.json apps/cli/package.json
COPY apps/mcp/package.json apps/mcp/package.json
COPY packages/biji-client/package.json packages/biji-client/package.json
COPY packages/biji-queue/package.json packages/biji-queue/package.json

# Only the CLI and its workspace deps — skips root-only tooling like bun.
RUN pnpm install --frozen-lockfile --filter "@gitnapp/biji-cli..."

COPY . .
RUN pnpm --filter "@gitnapp/biji-cli..." build

# ---- runtime ----
# The CLI (including `biji mcp`) is a single self-contained bundle with no
# node_modules, so that one file is all the runtime image needs.
FROM node:22-bookworm-slim
COPY --from=builder /app/apps/cli/dist/biji.js /usr/local/bin/biji

ENV NODE_ENV=production
WORKDIR /work
CMD ["biji", "mcp"]
