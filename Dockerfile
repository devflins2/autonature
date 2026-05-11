# Base image with Node.js
FROM node:20-slim AS builder

# No additional build tools needed for current dependencies.
# If you add native modules (like bcrypt or sharp) later, you can add them here.

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

# Install FFmpeg (runtime only, minimal installation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server

# Copy built assets and necessary files from builder
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/client/dist /app/client/dist

# Create temp directory for video processing
RUN mkdir -p temp && chmod 777 temp

# Environment variables
ENV NODE_ENV=production
ENV PORT=7860
ENV HF_SPACE=true
ENV TZ=Asia/Kolkata
EXPOSE 7860

# Port for Hugging Face
EXPOSE 7860

# Start the server from the server directory
CMD ["node", "dist/index.js"]
