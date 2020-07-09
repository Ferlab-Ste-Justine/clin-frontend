import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from '@hot-loader/react-dom';
import Keycloak from 'keycloak-js';

import HotConnectedApp, { ConnectedApp } from './containers/App';
import configureStore, { history, initialState } from './configureStore';

import { unregister } from './serviceWorker';
import './helpers/chromi';

const store = configureStore(initialState);
const App = module.hot ? HotConnectedApp : ConnectedApp;

const keycloak = Keycloak(JSON.parse(process.env.REACT_APP_KEYCLOAK_CONFIG));

const render = () => {
  keycloak.onTokenExpired = () => {
    keycloak.updateToken(-1)
      .then((refreshed) => {
        if (refreshed) {
          // Token was successfully refreshed
        } else {
          // Token is still valid
        }
      })
      .catch(() => {
        // Refresh token expired.  Access token could not be renews
        keycloak.logout();
      });
  };

  keycloak.init({ onLoad: 'login-required', checkLoginIframeInterval: 1 })
    .then((authenticated) => {
      if (!authenticated) {
        keycloak.login();
      } else {
        ReactDOM.render(
          <Provider id="provider" store={store}>
            <App id="app" history={history} />
          </Provider>,
          document.getElementById('root'),
        );
      }
    })
    .catch((error) => {
      // Keycloak is probably not configured properly - this should not happen.
      console.error('Failed to initialize login.  Check your authentication server configurations.', error);
    });
};

render();
unregister();

if (module.hot) {
  module.hot.accept('./containers/App', () => {
    render();
  });
}
