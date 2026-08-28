# Multi-Stage Production Dockerfile for Shothik API Server
# Stage 1: Build API Server
FROM node:22-alpine AS builder
WORKDIR /app

# Enable pnpm v9
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy monorepo workspace configs and package definitions
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* tsconfig*.json ./
COPY lib ./lib
COPY packages ./packages
COPY artifacts/api-server ./artifacts/api-server

# Install dependencies across workspace
RUN pnpm install --filter @workspace/api-server... --no-frozen-lockfile

# Build api-server bundle
WORKDIR /app/artifacts/api-server
RUN pnpm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Install runtime dependencies required by externalized bundle modules
RUN npm install --no-package-lock --no-save @pinojs/redact pino express cors dotenv

COPY --from=builder /app/lib /app/lib
COPY --from=builder /app/artifacts/api-server/dist /app/dist
COPY --from=builder /app/artifacts/api-server/package.json /app/package.json

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/healthz || exit 1

CMD ["node", "dist/index.mjs"]
