FROM node:22.21.0-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM nginx:stable
COPY --from=build /app/dist/frontend/browser/ /usr/share/nginx/html
EXPOSE 80
