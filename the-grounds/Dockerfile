# Multi-stage build for Next.js

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
