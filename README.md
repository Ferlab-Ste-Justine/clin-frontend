![](https://github.com/Ferlab-Ste-Justine/clin-frontend/workflows/Build/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/clin-frontend/workflows/Publish Image%20Using%20Commit%20Hash/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/clin-frontend/workflows/Publish%20Image%20Using%20Tag/badge.svg)

# CLIN Frontend

## Available Scripts

- `pnpm start` launches the app in development mode at [http://localhost:3000](http://localhost:3000)
- `pnpm test` launches the test runner in the interactive watch mode
- `pnpm run serve` serves the static assets from the `build` directory
- `pnpm run build` builds the app into the `build` directory
  - compatible with [these browsers](https://browserl.ist/?q=last+3+version%2C+not+op_mini+all%2C+not+%3C+1%25).<br>
  - bundles React in production mode and optimizes the build for the best performance:
    - [Code Splitting](https://facebook.github.io/create-react-app/docs/code-splitting)
    - [Analyzing the Bundle Size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)
    - [Progressive Web App](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
    - [Advanced Configurations](https://facebook.github.io/create-react-app/docs/advanced-configuration)
    - [Troubleshooting Failures to Minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Development Set-up

### Directly On Your Machine

Install [Redux Devtools Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run

```
cp -p .env.development .env
npm install -g pnpm
pnpm install
pnpm start
```

It is assumed that the clin-proxy-services are running locally on your machine.

### With Docker

Make sure you followed the instructions to have a Dockerized setup for the clin proxy api services: https://github.com/cr-ste-justine/clin-proxy-api#dockerized-version

Then, run:

```
cp env.docker.remote .env
docker-compose up -d
```

To stop, run:

```
docker-compose down
```

All references to other services point to the QA. A 100% local version will come in the future.

## CI/CD

### Pushing Images

See the documentation for our convention on gitflow and docker images: https://www.notion.so/ferlab/Developer-Handbook-ca9d689d8aca4412a78eafa2dfa0f8a8

### Deployements

Updates to the QA environment are automatically done once a new image is pushed. No action is required.

Procedures to deploy to prod will be fleshed out once we have such an environment.
