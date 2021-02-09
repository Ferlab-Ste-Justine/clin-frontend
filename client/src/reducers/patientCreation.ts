import { produce } from 'immer';
import get from 'lodash/get';
import * as actions from '../actions/type';
import { FamilyGroup, Patient } from '../helpers/fhir/types';

export enum PatientCreationStatus {
    IDLE,
    PROCESSING,
    CREATED
}

export type PatientCreationState = {
    patient?: Patient,
    ramqChecked: boolean;
    familyGroup?: FamilyGroup,
    status?: 'created' | 'error'
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const initialState: PatientCreationState = {
  ramqChecked: false,
};

const reducer = (
  state: PatientCreationState = initialState,
  action: Action,
) => produce<PatientCreationState>(state, (draft) => {
  switch (action.type) {
    case actions.CREATE_PATIENT_SUCCEEDED:
    case actions.CREATE_PATIENT_FETUS_SUCCEEDED: {
      draft.patient = action.payload.patient;
      draft.familyGroup = action.payload.familyGroup;
      draft.status = 'created';
      break;
    }
    case actions.CLOSE_CREATE_PATIENT_REQUESTED:
      draft.patient = undefined;
      draft.familyGroup = undefined;
      draft.ramqChecked = false;
      break;
    case actions.PATIENT_FETCH_INFO_BY_RAMQ_SUCCEEDED:
      draft.patient = get(action, 'payload.data.entry[0].resource');
      draft.ramqChecked = true;
      break;
    case actions.PATIENT_FETCH_INFO_BY_RAMQ_FAILED:
      draft.patient = undefined;
      draft.ramqChecked = true;
      break;
    case actions.CREATE_PATIENT_FAILED:
    case actions.CREATE_PATIENT_FETUS_FAILED: {
      draft.status = 'error';
      break;
    }
    default:
      break;
  }
});

export default reducer;
