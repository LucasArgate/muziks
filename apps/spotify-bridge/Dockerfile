# Build context: raiz do monorepo
#   docker build -f apps/spotify-bridge/Dockerfile -t muziks/spotify-bridge .

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @muziks/spotify-bridge build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache ca-certificates
# librespot: binário no host (LIBRESPOT_BIN) ou estender esta imagem
COPY --from=builder /app/apps/spotify-bridge/dist ./dist
COPY --from=builder /app/apps/spotify-bridge/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/spotify-bridge/node_modules ./apps/spotify-bridge/node_modules
EXPOSE 8765
CMD ["node", "dist/index.js"]
