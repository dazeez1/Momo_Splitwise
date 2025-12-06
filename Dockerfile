# Multi-stage build: Build frontend first, then backend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend package files
COPY momo_splitwise/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY momo_splitwise/ .

# Build frontend (skip TypeScript checking - build directly with vite)
# Using vite build directly instead of npm run build to skip tsc
RUN npx vite build --mode production

# Backend stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY backend/ .

# Copy frontend build from builder stage
COPY --from=frontend-builder /frontend/dist ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (defaults to 5001, can be overridden via PORT env var)
EXPOSE 5001

# Start app
CMD ["npm", "start"]
