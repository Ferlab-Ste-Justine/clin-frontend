![](https://github.com/Ferlab-Ste-Justine/clin-frontend/workflows/Build/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/clin-frontend/workflows/Publish%20Image%20Using%20Commit%20Hash/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/clin-frontend/workflows/Publish%20Image%20Using%20Tag/badge.svg)

# CLIN Frontend

## Available Scripts

- `npm start` launches the app in development mode at [http://localhost:3000](http://localhost:3000)
- `npm run test` launches the test runner in the interactive watch mode
- `npm run serve` serves the static assets from the `build` directory
- `npm run build` builds the app into the `build` directory
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
npm install
npm start
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

## Integration Testing

### Commands

`yarn test` / `npm run test`

Locally this command will run in `--watch` mode and on CI it won't

### The workarounds

#### Ant D `Form`

- The `onFinish` event handler on the `Form` component doesn't seems to run when you use `form.submit()` where `form` comes from `useForm()`.
  - To fix this, I used the `onSubmitCapture` to run the same function as `onFinish`
    - ```jsx
        onSubmitCapture={() => {
          onFormSubmit(form.getFieldsValue());
        }}
        onFinish={(values) => {
          onFormSubmit(values);
        }}
      ```

#### Ant D `Select`

- The `Select` component from Ant D isn't testable (you cannot open it and select an option)
  - The workaround is to mock it with the html `select`. Since the problem is global, the mock is done in `setupTests.tsx`. This way it's automatically applied for every tests. Some feature might not be supported currently but it can be modified/addapted to support them.

#### Ant D "Nested" `Form.Item`

- When using "Nested" `Form.Item` (using `name={['mrn', 'organization']}`), AntD doesn't assign any `name` property on the `input` field. This makes it impossible to select the `input` with the label (best) or by role and filtering by name.
  - You have to add the `data-testid` property supported by react-testing-library
    - More info on [the library documentation](https://testing-library.com/docs/queries/about/#priority)

## End-2-end testing

### Commands

- `yarn cypress:open` / `npm run cypress:open`
  - The app must be running (`yarn start`) in parallel for it to work
  - Best for tests development
- `yarn cypress:run:chrome` / `npm run cypress:run:chrome`
  - This command will open a Chrome instance, run the tests and close the Chrome instance
  - The closest to what runs on CI
- `yarn cypress:run:cli` / `npm run cypress:run:cli`
  - This command will run tests in a chromium instance
  - The fastest

#### Documentations

##### Main

- [Cypress](https://docs.cypress.io/)

##### Selectors

- [Cypress-Testing-Library](https://testing-library.com/docs/cypress-testing-library/intro/)
