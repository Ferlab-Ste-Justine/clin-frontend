import * as actions from './type';


// eslint-disable-next-line import/prefer-default-export
export const savePatient = patient => ({
  type: actions.PATIENT_SUBMISSION_SAVE_REQUESTED,
  payload: {
    patient,
  },
});
