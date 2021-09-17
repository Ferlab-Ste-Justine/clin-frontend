// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ReactKeycloakProvider } from '@react-keycloak/web';

import { ConnectedApp } from './containers/App';
import configureStore, { history, initialState } from './configureStore';
import keycloak from './keycloak';
import reportWebVitals from './reportWebVitals';

import './index.css';
import 'style/themes/clin/main.scss';

const store = configureStore(initialState);

ReactDOM.render(
  <ReactKeycloakProvider
    authClient={keycloak}
  >
    <React.StrictMode>
      <Provider id="provider" store={store}>
        <ConnectedApp id="app" history={history} />
      </Provider>
    </React.StrictMode>
  </ReactKeycloakProvider>,
  document.getElementById('root'),
);

reportWebVitals();
