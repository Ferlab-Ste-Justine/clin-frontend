import { Modal } from 'antd';
import { produce } from 'immer';
import intl from 'react-intl-universal';
import * as actions from '../actions/type';
import { ServiceRequest } from '../helpers/fhir/types';

export enum PatientRequestCreationStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

export type PatientRequestCreationState = {
  status: PatientRequestCreationStatus | null
  serviceRequestIds: string[]
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const initialState: PatientRequestCreationState = {
  status: null,
  serviceRequestIds: [],
};

const reducer = (
  state: PatientRequestCreationState = initialState,
  action: Action,
) => produce<PatientRequestCreationState>(state, (draft) => {
  switch (action.type) {
    case actions.CREATE_PATIENT_REQUEST_SUCCEEDED:
      draft.status = PatientRequestCreationStatus.SUCCEEDED;
      draft.serviceRequestIds = action.payload.serviceRequests.map((sr: ServiceRequest) => sr.id);
      break;
    case actions.CREATE_PATIENT_REQUEST_REQUESTED:
      draft.status = PatientRequestCreationStatus.IN_PROGRESS;
      break;
    case actions.CREATE_PATIENT_REQUEST_FAILED:
      draft.status = PatientRequestCreationStatus.FAILED;
      Modal.error({
        title: intl.get('screen.clinicalSubmission.notification.save.error.title'),
        content: intl.get('screen.clinicalSubmission.notification.save.error'),
      });
      break;

    case actions.CREATE_PATIENT_REQUEST_STATUS_RESET:
      draft.status = initialState.status;
      draft.serviceRequestIds = initialState.serviceRequestIds;
      break;
    default:
      break;
  }
});

export default reducer;
