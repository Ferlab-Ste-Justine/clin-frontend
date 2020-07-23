import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from '@hot-loader/react-dom';

import { KeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';

import HotConnectedApp, { ConnectedApp } from './containers/App';
import configureStore, { history, initialState } from './configureStore';
import { unregister } from './serviceWorker';
import './helpers/chromi';

const store = configureStore(initialState);
const App = module.hot ? HotConnectedApp : ConnectedApp;

const render = () => {
  ReactDOM.render(
    <KeycloakProvider
      keycloak={keycloak}
      initConfig={{
        onLoad: 'login-required',
      }}
    >
      <Provider id="provider" store={store}>
        <App id="app" history={history} />
      </Provider>
    </KeycloakProvider>,
    document.getElementById('root'),
  );
};

render();
unregister();

if (module.hot) {
  module.hot.accept('./containers/App', () => {
    render();
  });
}
