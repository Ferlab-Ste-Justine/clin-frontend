import * as actions from './type';

export const fetchPatient = uid => ({
  type: actions.PATIENT_FETCH_REQUESTED,
  payload: {
    uid,
  },
});

export const autoCompletePartialPatients = query => ({
  type: actions.PATIENT_AUTOCOMPLETE_REQUESTED,
  payload: {
    query,
    partial: true,
  },
});

export const autoCompleteFullPatients = query => ({
  type: actions.PATIENT_AUTOCOMPLETE_REQUESTED,
  payload: {
    query,
    partial: false,
  },
});

export const searchPatientsByQuery = query => ({
  type: actions.PATIENT_SEARCH_REQUESTED,
  payload: {
    query,
  },
});
