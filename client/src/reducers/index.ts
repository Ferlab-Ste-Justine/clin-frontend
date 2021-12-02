import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';

import appReducer from './app';
import patientReducer, { PatientState } from './patient';
import patientCreation, { PatientCreationState } from './patientCreation';
import patientEditionReducer, { PatientEditionState } from './patientEdition';
import patientSubmissionReducer from './patientSubmission';
import prescriptions, { PatientRequestCreationState } from './prescriptions';
import prescriptionsGraphql, { PrescriptionState } from './prescriptionsGraphql';
import searchReducer from './search';
import serviceRequestCodeReducer, { ServiceRequestCodeState } from './serviceRequestCode';
import userReducer from './user';
import variantReducer from './variant';
import variantDetailsReducer from './variantDetails';

const rootReducer = (history: any) => combineReducers({
  app: appReducer,
  patient: patientReducer,
  patientCreation,
  patientEdition: patientEditionReducer,
  patientSubmission: patientSubmissionReducer,
  prescriptions,
  prescriptionsGraphql,
  router: connectRouter(history),
  search: searchReducer,
  serviceRequestCode: serviceRequestCodeReducer,
  user: userReducer,
  variant: variantReducer,
  variantDetails: variantDetailsReducer,
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
  patientEdition: PatientEditionState,
  prescriptions: PatientRequestCreationState,
  prescriptionsGraphql: PrescriptionState
  serviceRequestCode: ServiceRequestCodeState
}
