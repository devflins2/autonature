# --- BUILD STAGE ---
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- RUNTIME STAGE ---
FROM node:20-slim

# Install FFmpeg for video processing
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files
COPY --from=builder /app/dist ./dist
RUN mkdir -p temp && chmod 777 temp

# Hugging Face uses port 7860 by default
ENV PORT=7860
EXPOSE 7860

CMD ["node", "dist/index.js"]
