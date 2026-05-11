# Base image with Node.js
FROM node:20-slim AS builder

# Install build essentials and ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies for everything
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy the rest of the source code
COPY . .

# Build Client (Frontend)
WORKDIR /app/client
RUN npm run build

# Build Server (Backend)
WORKDIR /app/server
RUN npm run build

# --- FINAL STAGE ---
FROM node:20-slim

# Re-install ffmpeg in final image
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built assets and necessary files from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=7860

# Port for Hugging Face
EXPOSE 7860

# Start the server
CMD ["node", "server/dist/index.js"]
