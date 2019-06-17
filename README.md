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

Install [Redux Devtools Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
cp -p .env.development .env
npm install -g pnpm
pnpm install
pnpm start
```

### Production Set-up

##### Manual Mode

Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
cp -p .env.production .env
npm install -g pnpm
pnpm install
pnpm build
pnpm serve
```

##### Docker Mode

`cp -p docker.env .env`

`docker network create -d overlay --attachable proxy`

###### Local Environment

`
copy docker.env .env
docker-compose up --build`

###### Pushing Changes to Qa/Prod

```
copy docker.env .env
docker-compose build 
docker push localhost:5000/clin-frontend-nginx:latest

docker tag localhost:5000/clin-frontend-nginx:latest localhost:5000/clin-frontend-nginx:1.0

docker push localhost:5000/clin-frontend-nginx:1.0

docker stack deploy -c docker-compose.yml qa-frontend
docker service update qa-frontend_nginx --image localhost:5000/clin-frontend-nginx:1.0

```
#### Update a service to another version i.e. (1.1)

```
copy docker.env .env

nano .env -- fix environment
docker-compose build
docker tag localhost:5000/clin-frontend-nginx:latest localhost:5000/clin-frontend-nginx:1.1
docker push localhost:5000/clin-frontend-nginx:1.1
docker service update qa-frontend_nginx --image localhost:5000/clin-frontend-nginx:1.1

```
To scale the service up or down...
```
docker service scale qa-frontend_nginx=3
or
use portainer (port 9000)
```