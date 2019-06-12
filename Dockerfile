FROM node:10.14.1-alpine
ADD . /code
WORKDIR /code
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build

#FROM node:10.14.1-alpine
#ADD . /code
#WORKDIR /code
#COPY --from=0 /code/client/build /code/client/build
#COPY --from=0 /code/package.json /code

CMD ["pnpm", "run", "serve"]
