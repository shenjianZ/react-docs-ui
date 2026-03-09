FROM node:20-alpine

LABEL maintainer="React Docs UI"
LABEL description="PDF generation server using Puppeteer"

WORKDIR /app

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wqy-zenhei \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml* package-lock.json* ./

RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --prod --ignore-scripts && \
    pnpm add tsx

COPY scripts/ ./scripts/
COPY tsconfig.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 6965

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:6965/health || exit 1

CMD ["npx", "tsx", "scripts/pdf-server.ts"]
