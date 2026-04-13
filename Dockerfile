# Self-check: cargo build --release is not applicable (this is a Node/Next.js app with no Cargo.toml); using a production Node runtime image.
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time defaults so Next.js SSG/Prisma can resolve env-dependent data.
ENV DATABASE_URL=file:./dev.db
ENV ADMIN_PASSWORD=build-password
ENV SESSION_SECRET=build-session-secret-build-session-secret
ENV BASE_URL=http://localhost:8080
RUN npx prisma generate && npx prisma migrate deploy && npm run build

FROM node:20-bookworm-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL=file:/app/data/dev.db

RUN mkdir -p /app/data

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma
COPY start.sh /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 8080
CMD ["/app/start.sh"]
