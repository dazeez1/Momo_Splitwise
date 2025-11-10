# Dockerfile
FROM node:20-alpine

# Node environment to production.
ENV NODE_ENV=production

# Working directory.
WORKDIR /app

# Create a dedicated non-root user and group.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files
COPY backend/package*.json ./backend/

# Install only the production dependencies.
RUN npm ci --prefix backend --omit=dev

# Copy the remaining source code.
COPY backend ./backend

# Ensure the non-root user owns the files.
RUN chown -R appuser:appgroup /app

# Switch to the non-root user.
USER appuser

# Move into the backend directory.
WORKDIR /app/backend

# Expose the port.
EXPOSE 5001

# Start the Express server.
CMD ["node", "server.js"]

