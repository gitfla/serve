# Use official Node.js LTS image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Run the server (use built JS, e.g., ./dist/index.js)
CMD ["node", "dist/index.js"]