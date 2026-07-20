# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

RUN corepack enable

# Install deps first (better layer caching). The standalone pnpm-workspace.yaml
# carries onlyBuiltDependencies (esbuild) so the native binary is set up.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine AS runner

# Replace the default server with our SPA config.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
