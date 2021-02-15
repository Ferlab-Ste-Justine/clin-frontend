import { produce } from 'immer';
import { message } from 'antd';
import intl from 'react-intl-universal';
import * as actions from '../actions/type';

export type PatientCreationState = {

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
) => produce<PatientCreationState>(state, () => {
  switch (action.type) {
    case actions.CREATE_PATIENT_REQUEST_SUCCEEDED:
      message.success(intl.get('screen.clinicalSubmission.notification.save.success'));
      break;
    case actions.CREATE_PATIENT_REQUEST_REQUESTED:
      break;
    case actions.CREATE_PATIENT_REQUEST_FAILED:
      message.success(intl.get('screen.clinicalSubmission.notification.save.error'));
      break;
    default:
      break;
  }
});

export default reducer;
