# ==========================================
# 1. Base Image
# ==========================================
FROM node:22-alpine AS base
WORKDIR /app
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
# Then build the client
ENV VITE_API_URL=/api
RUN npm run build --workspace=@brsr-srmm/client

# ==========================================
# 4. Runner (Nginx)
# ==========================================
FROM nginx:alpine AS runner
# Copy built assets to Nginx html folder
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Replace default config to support React Router SPA and reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
