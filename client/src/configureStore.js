import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import { cancel } from 'redux-saga/effects';
import { createBrowserHistory } from 'history';

import locales from './locales';
import createRootReducer from './reducers';
import createRootSaga from './sagas';

export const history = createBrowserHistory();
const sagaMiddleware = createSagaMiddleware();

export const initialState = {
  intl: {
    locale: 'en',
    messages: locales.en,
  },
};

export default function configureStore(preloadedState = {}) {
  let composeEnhancer = compose;
  if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) { // eslint-disable-line no-underscore-dangle, max-len
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
}
