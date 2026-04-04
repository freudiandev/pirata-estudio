FROM docker.io/library/node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache bash openssl wget

COPY package.json package-lock.json ./
RUN npm install

FROM deps AS builder

WORKDIR /app

COPY . .

RUN npx prisma generate
RUN npm run build

FROM deps AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000

CMD ["./docker/web/entrypoint.sh"]
