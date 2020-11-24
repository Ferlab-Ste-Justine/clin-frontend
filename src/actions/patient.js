import * as actions from './type';

export const fetchPatient = (uid) => ({
  type: actions.PATIENT_FETCH_REQUESTED,
  payload: {
    uid,
  },
});

export const autoCompletePatients = (type, query, page, size) => ({
  type: actions.PATIENT_AUTOCOMPLETE_REQUESTED,
  payload: {
    type: type || 'partial',
    query: query || null,
    page: page || 1,
    size: size || 25,
  },
});

export const autoCompletePatientsSelected = () => ({
  type: actions.PATIENT_AUTOCOMPLETE_SELECTED,
  payload: {},
});

export const searchPatientsByQuery = (query, page, size) => ({
  type: actions.PATIENT_SEARCH_REQUESTED,
  payload: {
    query: query || null,
    page: page || 1,
    size: size || 25,
  },
});
