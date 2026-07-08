FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Runtime deps only. geoip-lite ships ~60MB of data files loaded from its
# package directory at runtime, and esbuild marks packages external, so the
# built server.cjs still requires node_modules to exist here.
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
