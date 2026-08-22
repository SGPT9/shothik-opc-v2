# Multi-Stage Production Dockerfile for Shothik Hermes
# Targets: Lightweight Node.js 22 Alpine (<120MB final footprint)

# ── Stage 1: Dependency & Builder ──
FROM node:22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++

# Install PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy Workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY artifacts/shothik/package.json ./artifacts/shothik/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source tree
COPY . .

# Build API Server and Frontend bundle
RUN pnpm --filter @workspace/api-server run build || true
RUN pnpm --filter @workspace/shothik run build

# ── Stage 2: Production Runtime ──
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hermes

# Copy built artifacts and minimal dependencies
COPY --from=builder --chown=hermes:nodejs /app/artifacts/shothik/dist ./artifacts/shothik/dist
COPY --from=builder --chown=hermes:nodejs /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder --chown=hermes:nodejs /app/package.json ./package.json
COPY --from=builder --chown=hermes:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=hermes:nodejs /app/artifacts/api-server/node_modules ./artifacts/api-server/node_modules

USER hermes

EXPOSE 8080 5000

CMD ["node", "artifacts/api-server/dist/index.js"]
