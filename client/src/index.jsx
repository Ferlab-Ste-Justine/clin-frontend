import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from '@hot-loader/react-dom';

import HotConnectedApp, { ConnectedApp } from './containers/App';
import configureStore, { history, initialState } from './configureStore';

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

render();
unregister();

if (module.hot) {
  module.hot.accept('./containers/App', () => {
    render();
  });
}

if (window.CLIN.defaultUsername === '%REACT_APP_DEFAULT_USERNAME%') {
  window.CLIN.defaultUsername = '';
}
if (window.CLIN.defaultPassword === '%REACT_APP_DEFAULT_PASSWORD%') {
  window.CLIN.defaultPassword = '';
}
