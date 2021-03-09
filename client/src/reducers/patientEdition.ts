import intl from 'react-intl-universal';
import { message } from 'antd';
import produce from 'immer';
import * as actions from '../actions/type';

export enum PatientEditionStatus {
  ERROR = 'error',
  CREATED = 'created',
  PROCESSING = 'processing',
}

export type PatientEditionState = {
  status?: PatientEditionStatus
}

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const initialState: PatientEditionState = {};

const reducer = (
  state: PatientEditionState = initialState,
  action: Action,
) => produce<PatientEditionState>(state, (draft) => {
  switch (action.type) {
    case actions.PATIENT_EDITION_REQUESTED:
      draft.status = PatientEditionStatus.PROCESSING;
      break;

    case actions.PATIENT_EDITION_SUCCEEDED:
      message.success(intl.get('screen.patient.details.edit.success'));
      draft.status = PatientEditionStatus.CREATED;
      break;
    case actions.PATIENT_EDITION_FAILED:

      draft.status = PatientEditionStatus.ERROR;
      message.error(intl.get('screen.patient.details.edit.error'));
      draft.status = PatientEditionStatus.ERROR;
      break;

    default:
      break;
  }
});

export default reducer;
