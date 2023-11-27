FROM node:current-alpine3.18 AS build-stage
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY build-front.sh build-front.sh
COPY front front
# COPY public public
RUN npm ci
RUN sh build-front.sh

FROM node:current-alpine3.18
WORKDIR /app
COPY --from=build-stage /app/node_modules node_modules
COPY --from=build-stage /app/public public
COPY schemas schemas
COPY routes routes
COPY views views
COPY controllers controllers
COPY app.js app.js
# remove dev dependencies
RUN npm prune --omit=dev
CMD ["node", "app.js"]