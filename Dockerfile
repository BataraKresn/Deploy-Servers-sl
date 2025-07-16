# Dockerfile for Next.js + Tailwind + Lucide + Vaul

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm

# Optional: Copy default CSS if not exists to prevent build failure
RUN mkdir -p styles && touch styles/globals.css

RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm
COPY --from=builder /app .

# Ensure output exists and owned correctly
RUN mkdir -p .next public

EXPOSE 3000
CMD ["pnpm", "start"]
