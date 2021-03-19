import * as actions from './type';

type Action = (...args:any) => {type: keyof typeof actions, payload?: any};

export const createRequest: Action = (batch: any) => ({
  type: actions.CREATE_PATIENT_REQUEST_REQUESTED,
  payload: {
    batch,
  },
});

export const resetStatus: Action = () => ({
  type: actions.CREATE_PATIENT_REQUEST_STATUS_RESET,
});
