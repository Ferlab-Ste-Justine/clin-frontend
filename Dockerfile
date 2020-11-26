FROM node:10.14.1-alpine as builder
ADD . /code
WORKDIR /code
RUN npm install
RUN npm run build

FROM nginx:1 as server

COPY --from=builder /code/client/build /usr/share/nginx/html/
COPY --from=builder /code/client/build /var/www/html/

COPY static.conf /etc/nginx/conf.d/default.conf