FROM node:10.14-alpine
ADD . /code
WORKDIR /code
RUN cp -p .env.docker .env
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build
CMD ["pnpm", "run", "serve"]
