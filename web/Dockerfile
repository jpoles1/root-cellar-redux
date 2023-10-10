FROM node

# install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

FROM node

WORKDIR /app
COPY --from=0 /app .
COPY . .

COPY docker.env .env

#RUN bun run build
