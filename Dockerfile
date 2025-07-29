# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

# Install dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# Copy backend source and shared code
COPY server/tsconfig.json ./
COPY server/src ./src
COPY shared ../shared

# Build the server code
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim
WORKDIR /app

# Copy built output only
COPY --from=builder /app/server/dist ./dist

# Copy production dependencies
COPY server/package*.json ./
RUN npm install --omit=dev

EXPOSE 8080
CMD ["node", "dist/server/src/index.js"]
