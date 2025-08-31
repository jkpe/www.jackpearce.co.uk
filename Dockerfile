FROM node:22.19.0-alpine

# Create app directory
WORKDIR /app

# Install PM2 globally for better process management
RUN npm install pm2 -g

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the static site
RUN npm run build

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the port the Express server uses
EXPOSE 3000

# Use PM2 to run the application in production mode
CMD ["pm2-runtime", "server.js", "--name", "jackpearce-blog", "--env", "production"]