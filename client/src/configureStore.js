import createSagaMonitor from '@clarketm/saga-monitor';
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { cancel } from 'redux-saga/effects';

import createRootReducer from './reducers';
import createRootSaga from './sagas';

export const history = createBrowserHistory();

export const initialState = {};

const configureStoreDev = (preloadedState = {}) => {
  const monitor =
    process.env.NODE_ENV === 'development'
      ? createSagaMonitor({
        actionDispatch: false,
        color: '#4000F4',
        effectCancel: false,
        effectReject: true,
        effectResolve: true,
        effectTrigger: false,
        level: 'info',
        verbose: false,
      })
      : null;

  const sagaMiddleware = createSagaMiddleware({ sagaMonitor: monitor });

  let composeEnhancer = compose;
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    // eslint-disable-line no-underscore-dangle
    composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // eslint-disable-line no-underscore-dangle
      trace: true,
    });
  }

  const store = createStore(
    createRootReducer(history),
    preloadedState,
    composeEnhancer(applyMiddleware(routerMiddleware(history), sagaMiddleware)),
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
    compose(applyMiddleware(routerMiddleware(history), sagaMiddleware)),
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

let store;
export default function configureStore(preloadedState = {}) {
  store =
    process.env.NODE_ENV === 'development'
      ? configureStoreDev(preloadedState)
      : configureStoreProd(preloadedState);

  return store;
}

export type RootState = ReturnType<typeof store.getState>;
