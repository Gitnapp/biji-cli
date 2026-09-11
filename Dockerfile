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

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm -r build
# pnpm prune --prod wipes the whole .pnpm store on this pnpm 10 workspace
# (breaks module resolution), and an incremental `install --prod` leaves
# devDependencies like typescript behind — a fresh prod-only install from
# the already-populated local store is the only variant that actually
# strips them.
RUN rm -rf node_modules apps/cli/node_modules apps/mcp/node_modules \
  packages/biji-client/node_modules packages/biji-queue/node_modules \
  && pnpm install --prod --frozen-lockfile --offline

# ---- runtime ----
FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=builder /app /app

# tsc doesn't set the exec bit on its output
RUN chmod +x apps/cli/dist/cli.js apps/mcp/dist/index.js \
  && ln -s /app/apps/cli/dist/cli.js /usr/local/bin/biji \
  && ln -s /app/apps/mcp/dist/index.js /usr/local/bin/biji-mcp

ENV NODE_ENV=production
WORKDIR /work
CMD ["biji-mcp"]
