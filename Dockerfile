# Multi-stage build to fix the Docker build issue

# Stage 1: Builder - includes all dependencies for building the app
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (including devDependencies like @nestjs/cli)
RUN npm install

# Copy source code
COPY . .

# Build the application using the nest CLI (now available)
RUN npm run build

# Stage 2: Production - only runtime dependencies and compiled code
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy the compiled application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /usr/src/app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]