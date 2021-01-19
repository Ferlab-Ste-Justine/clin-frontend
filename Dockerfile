FROM node:14.15.1 as builder
ADD . /code
WORKDIR /code
RUN yarn
RUN yarn run build

FROM nginx:1 as server

COPY --from=builder /code/client/build /usr/share/nginx/html/
COPY --from=builder /code/client/build /var/www/html/

COPY static.conf /etc/nginx/conf.d/default.conf