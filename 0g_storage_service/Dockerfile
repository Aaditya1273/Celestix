# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first for layer caching
COPY package*.json ./

# Install production deps only
RUN npm ci --omit=dev

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:appgroup . .

# Create persistent data and logs directories with correct ownership
RUN mkdir -p data logs && chown -R appuser:appgroup data logs

USER appuser

EXPOSE 3002

# Health check — Docker will restart the container if this fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3002/health || exit 1

CMD ["node", "index.js"]
