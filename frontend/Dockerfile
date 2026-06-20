# syntax=docker/dockerfile:1

# --------------------------------------------------------------------------- #
# Base
# --------------------------------------------------------------------------- #
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./


# --------------------------------------------------------------------------- #
# Development target
# Used by docker-compose.yml
# --------------------------------------------------------------------------- #
FROM base AS dev

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# --------------------------------------------------------------------------- #
# Build target
# --------------------------------------------------------------------------- #
FROM base AS build

RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# --------------------------------------------------------------------------- #
# Production target
# Used by Railway and docker-compose.prod.yml
# --------------------------------------------------------------------------- #
FROM nginx:1.27-alpine AS prod

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]