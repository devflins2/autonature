# --- BUILD STAGE ---
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# --- RUNTIME STAGE ---
FROM node:20-slim

# Install FFmpeg (CRITICAL for video processing)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
# Create temp directory
RUN mkdir -p temp

EXPOSE 5000

CMD ["node", "dist/index.js"]
