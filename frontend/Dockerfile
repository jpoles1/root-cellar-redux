FROM bun:1.0

# install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN bun i

COPY . .

FROM bun:1.0

WORKDIR /app
COPY --from=0 /app .
COPY . .

COPY docker.env .env

RUN bun run build
