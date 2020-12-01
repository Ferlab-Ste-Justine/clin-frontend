// @ts-nocheck
import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import './index.css';
import 'antd/dist/antd.css';
import { KeycloakProvider } from '@react-keycloak/web';
import reportWebVitals from './reportWebVitals';
import keycloak from './keycloak';
import { ConnectedApp } from './containers/App';
import configureStore, { history, initialState } from './configureStore';

const store = configureStore(initialState);
ReactDOM.render(
  <React.StrictMode>
    <KeycloakProvider
      keycloak={keycloak}
      initConfig={{
        // onLoad: 'login-required',
        checkLoginIframe: true,
        checkLoginIframeInterval: 5,
        timeSkew: 5,
      }}
    >
      <Provider id="provider" store={store}>
        <ConnectedApp id="app" history={history} />
      </Provider>
    </KeycloakProvider>,
  </React.StrictMode>,
  document.getElementById('root'),
);

reportWebVitals();
