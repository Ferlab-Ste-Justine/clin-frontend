import { ISyntheticSqon } from '@ferlab/ui/core/data/sqon/types'

import * as actions from '../actions/type';
import { ServiceRequest } from '../helpers/fhir/types';

export enum PatientRequestCreationStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

export type PrescriptionState = {
  status: PatientRequestCreationStatus | null
  sqons: ISyntheticSqon[]
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const initialState: PrescriptionState = {
  sqons: [],
  status: null,
};

const reducer = (
  state: PrescriptionState = initialState,
  action: Action,
): Readonly<PrescriptionState> => {

  switch (action.type) {
    case actions.CREATE_PATIENT_REQUEST_SUCCEEDED:
      return {
        sqons: action.payload.serviceRequests.map((sr: ServiceRequest) => sr.id),
        status: PatientRequestCreationStatus.SUCCEEDED,
      };
    case actions.CREATE_PATIENT_REQUEST_REQUESTED:
      return {
        sqons: [],
        status: PatientRequestCreationStatus.IN_PROGRESS,
      };
    case actions.CREATE_PATIENT_REQUEST_FAILED:
      return {
        sqons: [],
        status: PatientRequestCreationStatus.FAILED,
      };
    case actions.CREATE_PATIENT_REQUEST_STATUS_RESET:
      return initialState
    default:
      return state;
  }
};

export default reducer;
