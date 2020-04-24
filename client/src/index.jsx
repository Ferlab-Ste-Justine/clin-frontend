import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from '@hot-loader/react-dom';

import HotConnectedApp, { ConnectedApp } from './containers/App';
import configureStore, { history, initialState } from './configureStore';

import {
  checkUserSession,
} from './actions/user';

import { unregister } from './serviceWorker';
import './helpers/chromi';


const store = configureStore(initialState);
const App = module.hot ? HotConnectedApp : ConnectedApp;

const render = () => {
  ReactDOM.render(
    <Provider id="provider" store={store}>
      <App id="app" history={history} />
    </Provider>,
    document.getElementById('root'),
  );
};

const SESSION_CHECK_INTERVAL = 30000;
let sessionCheckTimer = null;
const startPeriodicSessionCheck = () => {
  sessionCheckTimer = setInterval(() => {
    store.dispatch(checkUserSession());
  }, SESSION_CHECK_INTERVAL);
};

// eslint-disable-next-line no-unused-vars
const stopPeriodicSessionCheck = () => {
  clearInterval(sessionCheckTimer);
};

render();
unregister();
startPeriodicSessionCheck();

if (module.hot) {
  module.hot.accept('./containers/App', () => {
    render();
  });
}
