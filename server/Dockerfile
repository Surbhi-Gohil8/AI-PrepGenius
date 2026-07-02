# Stage 1: Compile TypeScript Code
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Execution Image
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Create upload directories and adjust permissions for security
RUN mkdir -p uploads/audio uploads/resumes && \
    chown -R node:node /app

USER node
EXPOSE 5000

CMD ["node", "dist/index.js"]
