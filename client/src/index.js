import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'

import App from './containers/App'
import configureStore, { history } from './configureStore'

import { unregister } from './serviceWorker';

const store = configureStore();

const render = () => {
    ReactDOM.render(
            <Provider store={store}>
                <App history={history} />
            </Provider>,
        document.getElementById('root')
    )
}

render();
unregister();

// Hot reloading
if (module.hot) {
    // Reload components
    module.hot.accept('./containers/App', () => {
        render()
    })
}

