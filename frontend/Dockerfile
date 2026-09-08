# ---------- Stage 1: Build the React app ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first to cache npm dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the production bundle
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx runs on port 80 inside the container
EXPOSE 80

# Nginx starts automatically;