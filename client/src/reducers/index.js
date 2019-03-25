import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router'; // eslint-ignore-line
import { intlReducer } from 'react-intl-redux'; // eslint-ignore-line

import appReducer from './app';
import userReducer from './user';

const rootReducer = history => combineReducers({
  app: appReducer,
  intl: intlReducer,
  router: connectRouter(history),
  user: userReducer,
});

export default rootReducer;
