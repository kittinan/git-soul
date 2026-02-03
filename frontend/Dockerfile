# Stage 1 build
FROM node:18-alpine AS builder

# Set working directory to /app (will contain our app code)
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all application code
COPY . .

# Stage 2 - Production
FROM node:18-alpine
WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/package*.json

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start application in production mode
CMD ["node", "node_modules/.next/standalone/server.js", "-H", "X-Forwarded-Host", "0.0.0.0"]
