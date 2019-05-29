import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router'; // eslint-ignore-line
import { intlReducer } from 'react-intl-redux'; // eslint-ignore-line

import appReducer from './app';
import patientReducer from './patient';
import searchReducer from './search';
import userReducer from './user';

const rootReducer = history => combineReducers({
  app: appReducer,
  intl: intlReducer,
  patient: patientReducer,
  router: connectRouter(history),
  search: searchReducer,
  user: userReducer,
});

export default rootReducer;
