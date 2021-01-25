import { produce } from 'immer';
import * as actions from '../actions/type';
import { FamilyGroup, Patient } from '../helpers/fhir/types';

export enum PatientCreationStatus {
    IDLE,
    PROCESSING,
    CREATED
}

export type PatientCreationState = {
    patient?: Patient,
    familyGroup?: FamilyGroup,
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const initialState: PatientCreationState = {};

const reducer = (
  state: PatientCreationState = initialState,
  action: Action,
) => produce<PatientCreationState>(state, (draft) => {
  switch (action.type) {
    case actions.CREATE_PATIENT_SUCCEEDED: {
      draft.patient = action.payload.patient;
      draft.familyGroup = action.payload.familyGroup;
      break;
    }
    case actions.CLOSE_CREATE_PATIENT_REQUESTED:
      draft.patient = undefined;
      draft.familyGroup = undefined;
      break;
    default:
      break;
  }
});

export default reducer;
