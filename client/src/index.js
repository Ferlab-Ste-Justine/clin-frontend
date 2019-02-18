import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './containers/App'

import { history } from './configureStore';
import configureStore from './configureStore';
import { unregister } from './serviceWorker';

const store = configureStore();

// https://www.npmjs.com/package/redux-saga-router

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
);

unregister();
