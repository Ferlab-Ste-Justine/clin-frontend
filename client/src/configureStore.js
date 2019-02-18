import { applyMiddleware, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import sagas from './sagas';
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';

export const history = createHistory()
const sagaMiddleware = createSagaMiddleware();
const reduxRouterMiddleware = routerMiddleware(history)

export default function configureStore(preloadedState={}) {
    const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

    const enhancer = composeEnhancer(
        applyMiddleware(
            reduxRouterMiddleware,
            sagaMiddleware,
        ),
    );

    const store = createStore(rootReducer, preloadedState, enhancer);

    // Hot reloading
    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./reducers', () => {
            store.replaceReducer(configureStore);
        });
    }

    sagaMiddleware.run(sagas)

    return store
}
