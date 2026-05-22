# ─── Stage 1: Build Backend ──────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN apk add --no-cache python3 make g++
# Force development so npm ci installs devDependencies (TypeScript, etc.)
ENV NODE_ENV=development
RUN npm ci
COPY backend/ ./
RUN npm run build

# ─── Stage 2: Build Frontend ─────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Force development so npm ci installs devDependencies (Next.js build tools, etc.)
ENV NODE_ENV=development
RUN npm ci
COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://localhost:5000
# Set production only for the actual build step
RUN NODE_ENV=production npm run build

# ─── Stage 3: Runner ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Install concurrently to run both backend and frontend easily
RUN npm install -g concurrently

# Copy Backend production assets
WORKDIR /app/backend
COPY backend/package*.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev \
    && apk del .build-deps
COPY --from=backend-builder /app/backend/dist ./dist

# Copy Frontend production assets
WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static

# Expose Next.js port (Next.js automatically proxies api requests to backend internally)
EXPOSE 3000

# Run both backend and frontend concurrently under their respective directories
WORKDIR /app
CMD ["concurrently", "--names", "backend,frontend", "-c", "yellow,blue", "cd /app/backend && node dist/index.js", "cd /app/frontend && node server.js"]
