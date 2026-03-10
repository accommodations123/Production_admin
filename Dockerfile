FROM node:22-alpine AS build
WORKDIR /admin-accommodations
COPY package.json package-lock.json* yarn.lock* ./
 
# allow legacy peer deps so install won't fail on peer conflicts
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
ENV NPM_CONFIG_UNSAFE_PERM=true
 
# use npm ci (faster/clean) but with legacy-peer-deps honored
RUN npm ci --loglevel verbose
 
COPY . .
RUN npm run build
 
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /admin-accommodations/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 2246 80 8080
CMD ["nginx", "-g", "daemon off;"]