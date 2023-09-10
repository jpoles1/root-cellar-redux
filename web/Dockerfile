FROM oven/bun:1.0

# install dependencies
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun i

COPY . .

FROM node

WORKDIR /app
COPY --from=0 /app .
COPY . .

COPY docker.env .env

#RUN bun run build
