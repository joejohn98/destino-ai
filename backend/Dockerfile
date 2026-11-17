# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS build
COPY packages/shared ./packages/shared
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm ci
WORKDIR /app/packages/shared
RUN npx tsc
WORKDIR /app/backend
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build && npm prune --omit=dev

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build --chown=node:node /app/packages/shared/dist /app/packages/shared/dist
COPY --from=build --chown=node:node /app/packages/shared/package.json /app/packages/shared/package.json
COPY --from=build --chown=node:node /app/backend/package.json /app/backend/package.json
COPY --from=build --chown=node:node /app/backend/package-lock.json /app/backend/package-lock.json
COPY --from=build --chown=node:node /app/backend/node_modules /app/backend/node_modules
COPY --from=build --chown=node:node /app/backend/dist /app/backend/dist

WORKDIR /app/backend
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/index.js"]
