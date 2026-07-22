FROM node:lts-alpine AS build
WORKDIR /src
COPY package*.json ./
RUN npm ci
COPY . ./   
RUN npm run build

FROM node:lts-alpine
WORKDIR /src
COPY --from=build /src/.output ./.output
COPY --from=build /src/package*.json ./
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]