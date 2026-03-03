FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Install dependencies (staging-root-relative paths)
COPY vibe-client/package.json vibe-client/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false --ignore-scripts

# Copy source and build
COPY vibe-client/tsconfig.json vibe-client/vite.config.ts vibe-client/vite-env.d.ts vibe-client/index.html ./
COPY vibe-client/src/ src/
RUN pnpm run build

# Production stage — nginx serves static files
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing (all routes -> index.html)
COPY vibe-client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/ || exit 1
