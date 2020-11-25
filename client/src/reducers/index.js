import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import appReducer from './app';
import patientReducer from './patient.ts';
import searchReducer from './search';
import userReducer from './user';
import variantReducer from './variant';
import variantDetailsReducer from './variantDetails';
import patientSubmissionReducer from './patientSubmission';

const rootReducer = (history) => combineReducers({
  router: connectRouter(history),
  app: appReducer,
  user: userReducer,
  patient: patientReducer,
  search: searchReducer,
  variant: variantReducer,
  variantDetails: variantDetailsReducer,
  patientSubmission: patientSubmissionReducer,
});

export default rootReducer;
