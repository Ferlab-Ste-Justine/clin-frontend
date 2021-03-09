import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import appReducer from './app';
import patientReducer, { PatientState } from './patient';
import searchReducer from './search';
import userReducer from './user';
import variantReducer from './variant';
import variantDetailsReducer from './variantDetails';
import patientSubmissionReducer from './patientSubmission';
import patientCreation, { PatientCreationState } from './patientCreation';
import prescriptions from './prescriptions';
import patientEditionReducer, { PatientEditionState } from './patientEdition';

const rootReducer = (history: any) => combineReducers({
  router: connectRouter(history),
  app: appReducer,
  user: userReducer,
  patient: patientReducer,
  search: searchReducer,
  variant: variantReducer,
  variantDetails: variantDetailsReducer,
  patientSubmission: patientSubmissionReducer,
  patientEdition: patientEditionReducer,
  patientCreation,
  prescriptions,
});

export default rootReducer;

export type State = {
  router: any
  app: any,
  user: any,
  patient: PatientState,
  search: any,
  variant: any,
  variantDetails: any,
  patientSubmission: any,
  patientCreation: PatientCreationState,
  patientEdition: PatientEditionState
}
