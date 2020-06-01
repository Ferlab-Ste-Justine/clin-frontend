# CLIN Frontend

### Available Scripts

* `pnpm start` launches the app in development mode at [http://localhost:3000](http://localhost:3000)
* `pnpm test` launches the test runner in the interactive watch mode
* `pnpm run serve` serves the static assets from the `build` directory
* `pnpm run build` builds the app into the `build` directory
  * compatible with [these browsers](https://browserl.ist/?q=last+3+version%2C+not+op_mini+all%2C+not+%3C+1%25).<br>
  * bundles React in production mode and optimizes the build for the best performance:
    * [Code Splitting](https://facebook.github.io/create-react-app/docs/code-splitting)
    * [Analyzing the Bundle Size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)
    * [Progressive Web App](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
    * [Advanced Configurations](https://facebook.github.io/create-react-app/docs/advanced-configuration)
    * [Troubleshooting Failures to Minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

### Development Set-up

#### Directly On Your Machine

Install [Redux Devtools Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
cp -p .env.development .env
npm install -g pnpm
pnpm install
pnpm start
```

#### With Docker

Make sure you followed the instructions to have a Dockerized setup for the clin proxy api services: https://github.com/cr-ste-justine/clin-proxy-api#dockerized-version

Then, run:

```
cp env.docker.development .env
docker-compose -f docker-compose-docker-local.yml up -d
```

To stop, run:

```
docker-compose -f docker-compose-docker-local.yml down
```

#### Prod-like Local Setup with Docker

- Follow the instructions for a production setup below.

- Follow the instructions to have a running external proxy (if you don't want to launch all the services the external proxy points to, you can remove entries in its **external-proxy.conf** configuration file): https://github.com/cr-ste-justine/clin-external-proxy

### Production Set-up

`cp -p docker.env .env`

Fill in any missing secret (ignore the certificate entries, they are no longer needed).

Then, type:

```
./apply.sh
```

### Production Update

We are transitioning toward a gitops workflow. 

The current procedure is as follows:

- Make sure you increment the version number in **package.json** and get your changes merged in **dev**.

- Make any orchestration modification you need to make in **docker-compose.yml** (including changing the image version) and get it merged in **dev**.

- Update the repo dev branch on **workflow** and run:

```
./apply.sh
```