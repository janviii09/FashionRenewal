# ============================================
# Multi-Stage Docker Build for NestJS Backend
# ============================================
# This Dockerfile is optimized for production deployment
# of a NestJS backend in a monorepo structure.

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20.10-alpine AS dependencies

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/

# Install ALL dependencies (including devDependencies for build)
WORKDIR /app/backend
RUN npm ci

# ============================================
# Stage 2: Build
# ============================================
FROM node:20.10-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules

# Copy backend source code
COPY backend ./backend

# Copy Prisma schema
WORKDIR /app/backend

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS application
# This uses the local nest CLI from node_modules
RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
FROM node:20.10-alpine AS production

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy Prisma schema for runtime
COPY backend/prisma ./prisma

# Generate Prisma Client for production
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./dist

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
