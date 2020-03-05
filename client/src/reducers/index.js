import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import appReducer from './app';
import patientReducer from './patient';
import searchReducer from './search';
import userReducer from './user';
import variantReducer from './variant';
import variantDetailsReducer from './variantDetails';

const rootReducer = history => combineReducers({
  router: connectRouter(history),
  app: appReducer,
  user: userReducer,
  patient: patientReducer,
  search: searchReducer,
  variant: variantReducer,
  variantDetails: variantDetailsReducer,
});

export default rootReducer;
