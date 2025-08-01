# 依存だけインストールするステージ
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 開発用にソースをマウントして dev サーバー
FROM node:18-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# ソースは docker-compose でマウントするのでここではコピーしない
EXPOSE 3000
CMD ["npm", "run", "dev"]
