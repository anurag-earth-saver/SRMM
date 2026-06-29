# ==========================================
# 1. Base Image
# ==========================================
FROM node:22-alpine AS base
WORKDIR /app
# Enable corepack for modern package management if needed
RUN corepack enable

# ==========================================
# 2. Dependencies
# ==========================================
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Copy workspace definitions
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies (only what's needed for the server to build)
RUN npm install

# ==========================================
# 3. Builder
# ==========================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the shared package first
RUN npm run build --workspace=@brsr-srmm/shared
# Then build the server
RUN npm run build --workspace=@brsr-srmm/server

# ==========================================
# 4. Runner
# ==========================================
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/dist ./server/dist

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=@brsr-srmm/server"]
