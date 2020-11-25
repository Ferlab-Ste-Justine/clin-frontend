import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import { cancel } from 'redux-saga/effects';
import createSagaMonitor from '@clarketm/saga-monitor';
import { createBrowserHistory } from 'history';

import createRootReducer from './reducers';
import createRootSaga from './sagas';

export const history = createBrowserHistory();

export const initialState = {};

const configureStoreDev = (preloadedState = {}) => {
  const monitor = process.env.NODE_ENV === 'development' ? createSagaMonitor({
    level: 'info',
    verbose: false,
    color: '#4000F4',
    effectTrigger: false,
    effectResolve: true,
    effectReject: true,
    effectCancel: false,
    actionDispatch: false,
  }) : null;

  const sagaMiddleware = createSagaMiddleware({ sagaMonitor: monitor });

  let composeEnhancer = compose;
  if (window.__REDUX_DEVTOOLS_EXTENSION__) { // eslint-disable-line no-underscore-dangle
    composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ // eslint-disable-line no-underscore-dangle
      trace: true,
    });
  }

  const store = createStore(
    createRootReducer(history),
    preloadedState,
    composeEnhancer(
      applyMiddleware(
        routerMiddleware(history),
        sagaMiddleware,
      ),
    ),
  );

  sagaMiddleware.run(createRootSaga);

  module.hot.accept('./reducers', () => {
    store.replaceReducer(createRootReducer(history));
  });
  module.hot.accept('./sagas', () => {
    cancel(createRootSaga);
    sagaMiddleware.run(createRootSaga);
  });

  return store;
};

const configureStoreProd = (preloadedState = {}) => {
  const sagaMiddleware = createSagaMiddleware({ sagaMonitor: null });

  const store = createStore(
    createRootReducer(history),
    preloadedState,
    compose(
      applyMiddleware(
        routerMiddleware(history),
        sagaMiddleware,
      ),
    ),
  );

  sagaMiddleware.run(createRootSaga);

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createRootReducer(history));
    });
    module.hot.accept('./sagas', () => {
      cancel(createRootSaga);
      sagaMiddleware.run(createRootSaga);
    });
  }

  return store;
};

export default function configureStore(preloadedState = {}) {
  if (process.env.NODE_ENV === 'development') {
    return configureStoreDev(preloadedState);
  }
  return configureStoreProd(preloadedState);
}
