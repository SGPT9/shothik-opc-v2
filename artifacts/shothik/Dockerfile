# Multi-Stage Production Dockerfile for Shothik Frontend Shell
# Stage 1: Build Frontend
FROM node:22-alpine AS builder
WORKDIR /app

# Enable pnpm v9
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace configs and package definitions
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* tsconfig*.json ./
COPY lib ./lib
COPY artifacts/shothik ./artifacts/shothik

# Install dependencies across workspace
RUN pnpm install --filter @workspace/shothik... --no-frozen-lockfile

# Build static assets
WORKDIR /app/artifacts/shothik
RUN pnpm run build

# Stage 2: Production Server Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production server dependencies
RUN npm install express cors dotenv

# Copy built assets from builder
COPY --from=builder /app/artifacts/shothik/dist ./dist
COPY --from=builder /app/artifacts/shothik/server ./server
COPY --from=builder /app/artifacts/shothik/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server/index.mjs"]
