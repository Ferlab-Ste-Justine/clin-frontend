import { produce } from 'immer';
import get from 'lodash/get';

import * as actions from '../actions/type';
import { FamilyGroup, Patient } from '../helpers/fhir/types';

export enum PatientCreationStatus {
    ERROR = 'error',
    CREATED = 'created'
}

export type PatientCreationState = {
    patient?: Patient,
    familyGroup?: FamilyGroup,
    status?: PatientCreationStatus
    isFetchingPatientInfoByRamq: boolean
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const initialState: PatientCreationState = {
  isFetchingPatientInfoByRamq: false,
};

const reducer = (
  state: PatientCreationState = initialState,
  action: Action,
) => produce<PatientCreationState>(state, (draft) => {
  switch (action.type) {
  case actions.CREATE_PATIENT_SUCCEEDED: {
    draft.patient = action.payload.patient;
    draft.familyGroup = action.payload.familyGroup;
    draft.status = PatientCreationStatus.CREATED;
    break;
  }
  case actions.CREATE_PATIENT_FETUS_SUCCEEDED: {
    draft.patient = action.payload.patientFetus;
    draft.familyGroup = action.payload.familyGroup;
    draft.status = PatientCreationStatus.CREATED;
    break;
  }
  case actions.CLOSE_CREATE_PATIENT_REQUESTED:
    draft.patient = undefined;
    draft.familyGroup = undefined;
    draft.status = undefined;
    break;
  case actions.PATIENT_FETCH_INFO_BY_RAMQ:
    draft.isFetchingPatientInfoByRamq = true;
    break;
  case actions.PATIENT_FETCH_INFO_BY_RAMQ_SUCCEEDED:
    draft.patient = get(action, 'payload.data.entry[0].resource');
    draft.isFetchingPatientInfoByRamq = false;
    break;
  case actions.PATIENT_FETCH_INFO_BY_RAMQ_FAILED:
    draft.patient = undefined;
    draft.isFetchingPatientInfoByRamq = false;
    break;
  case actions.CREATE_PATIENT_FAILED:
  case actions.CREATE_PATIENT_FETUS_FAILED: {
    draft.status = PatientCreationStatus.ERROR;
    break;
  }
  default:
    break;
  }
});

export default reducer;
