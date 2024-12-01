FROM node:20.9.0-slim AS base
# OpenSSL required for prisma
RUN apt-get update && apt-get install -y openssl curl
RUN npm i -g pnpm@9.11.0


FROM base AS install
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


FROM install AS release
WORKDIR /usr/src/app

COPY . .

EXPOSE 3000
 
CMD [ "pnpm", "start" ]