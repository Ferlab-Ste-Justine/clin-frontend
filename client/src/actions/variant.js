import * as actions from './type';


export const fetchSchema = () => ({
  type: actions.VARIANT_SCHEMA_REQUESTED,
});

export const selectQuery = (patient, query) => ({
  type: actions.PATIENT_VARIANT_QUERY_SELECTION,
  payload: {
    patient,
    query,
  },
});

export const replaceQuery = query => ({
  type: actions.PATIENT_VARIANT_QUERY_REPLACEMENT,
  payload: {
    query,
  },
});

export const removeQuery = query => ({
  type: actions.PATIENT_VARIANT_QUERY_REMOVAL,
  payload: {
    query,
  },
});
