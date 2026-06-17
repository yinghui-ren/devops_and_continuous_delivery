FROM node:22-bookworm-slim

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY app/package*.json ./
RUN npm ci --omit=dev

COPY app/ ./

EXPOSE 3000

CMD ["npm", "start"]
