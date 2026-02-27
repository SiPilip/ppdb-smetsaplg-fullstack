# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps

# Install libc compatibility untuk alpine (dibutuhkan beberapa native modules)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install HANYA production dependencies
RUN npm ci

# ============================================================
# Stage 2: Build aplikasi
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules dari stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy semua source code
COPY . .

# Set env untuk build (nilai placeholder, env asli di runtime)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js (menghasilkan .next/standalone)
RUN npm run build

# ============================================================
# Stage 3: Production image (sekecil mungkin)
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy hanya file yang diperlukan dari stage builder
COPY --from=builder /app/public ./public

# Copy standalone output (Next.js standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Pastikan folder uploads tersedia
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads

USER nextjs

EXPOSE 3005

ENV PORT=3005
ENV HOSTNAME="0.0.0.0"

# Jalankan server standalone Next.js
CMD ["node", "server.js"]
