# Multi-stage Docker build for GitHub Actions Demo Application
# TechStaX Developer Assessment - Production-ready containerization

# Stage 1: Build environment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/

# Create necessary directories
RUN mkdir -p logs

# Stage 2: Production environment
FROM node:18-alpine AS production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S actionrepo -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files from builder stage
COPY --from=builder --chown=actionrepo:nodejs /app/src ./src
COPY --from=builder --chown=actionrepo:nodejs /app/scripts ./scripts

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    chown -R actionrepo:nodejs logs

# Install security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Switch to non-root user
USER actionrepo

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1) \
    }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/app.js"]

# Labels for metadata
LABEL maintainer="TechStaX Developer Assessment" \
      version="1.0.0" \
      description="GitHub Actions Demo Application" \
      org.opencontainers.image.title="action-repo" \
      org.opencontainers.image.description="GitHub Actions demonstration for TechStaX assessment" \
      org.opencontainers.image.vendor="TechStaX" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.created="2025-07-02" \
      org.opencontainers.image.source="https://github.com/YOUR_USERNAME/action-repo"