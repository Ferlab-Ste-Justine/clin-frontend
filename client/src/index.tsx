// @ts-nocheck
import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import './index.css';
import 'antd/dist/antd.css';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import reportWebVitals from './reportWebVitals';
import keycloak from './keycloak';
import { ConnectedApp } from './containers/App';
import configureStore, { history, initialState } from './configureStore';

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
