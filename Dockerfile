FROM node:22.14.0-alpine

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the static site
RUN npm run build

# Expose the port the Express server uses
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]