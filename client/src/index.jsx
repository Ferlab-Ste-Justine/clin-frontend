import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from '@hot-loader/react-dom';
import { KeycloakProvider } from '@react-keycloak/web';

import HotConnectedApp, { ConnectedApp } from './containers/App';
import configureStore, { history, initialState } from './configureStore';
import keycloak, { keycloakProviderInitConfig } from './components/Auth/keycloak';

import { unregister } from './serviceWorker';
import './helpers/chromi';

const store = configureStore(initialState);
const App = module.hot ? HotConnectedApp : ConnectedApp;

const logEvent = (t, e) => {
  console.log('kc onInit : , t', t);
  console.log('kc onInit : , e', e);
};

const render = () => {
  ReactDOM.render(
    <Provider id="provider" store={store}>
      <KeycloakProvider
        keycloak={keycloak}
        initConfig={keycloakProviderInitConfig()}
        onEvent={(t, e) => {
          console.log('kc onEvent :', e);
        }}
        onReady={logEvent}
        onAuthSuccess={logEvent}
        onTokens={logEvent}
      >
        <App id="app" history={history} />
      </KeycloakProvider>
    </Provider>,
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
