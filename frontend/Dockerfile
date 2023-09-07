FROM node

# install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

FROM node

WORKDIR /app
COPY --from=0 /app .
COPY . .

COPY docker.env .env

RUN npm run build
