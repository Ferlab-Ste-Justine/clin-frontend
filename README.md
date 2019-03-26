# clin-frontend

### Development Set-up
* Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md)
* `cp .env.development .env.development.local`
* `npm install -g pnpm`
* `pnpm install -g pnpm`
* `pnpm i` https://github.com/pnpm/pnpm/issues/1360

### Available Scripts

##### `pnpm start`
Runs the app in development mode.<br>
Point your browser to [http://localhost:3000](http://localhost:3000) to view.

##### `pnpm test`
Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.


### Production Set-up

##### `pnpm run build`
Builds the app for production into the `build` directory, compatible with [these browsers](https://browserl.ist/?q=last+3+version%2C+not+op_mini+all%2C+not+%3C+1%25).<br>
It correctly bundles React in production mode and optimizes the build for the best performance.
* [Code Splitting](https://facebook.github.io/create-react-app/docs/code-splitting)
* [Analyzing the Bundle Size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)
* [Progressive Web App](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
* [Advanced Configurations](https://facebook.github.io/create-react-app/docs/advanced-configuration)
* [Troubleshooting Failures to Minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

##### `pnpm run serve`
Serves the static assets from the `build` directory.

## Docker Set-up

Update `docker.env`

For Local Environment:
```
docker-compose up
```
