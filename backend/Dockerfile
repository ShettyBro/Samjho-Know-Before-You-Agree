FROM node:22-slim AS builder
WORKDIR /repo
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY extension/package.json extension/package.json
RUN npm ci
COPY backend backend
RUN npm run build -w backend

FROM node:22-slim AS production
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY extension/package.json extension/package.json
RUN npm ci --omit=dev
COPY --from=builder /repo/backend/dist backend/dist
EXPOSE 4000
CMD ["node", "backend/dist/index.js"]
