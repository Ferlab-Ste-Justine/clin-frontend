import * as actions from './type';

export const fetchPatient = uid => ({
  type: actions.PATIENT_FETCH_REQUESTED,
  payload: uid,
});

export const searchPatient = (query) => ({
  type: actions.PATIENT_SEARCH_REQUESTED,
  payload: {
    query,
  },
});
