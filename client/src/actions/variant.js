import * as actions from './type';


export const fetchSchema = () => ({
  type: actions.VARIANT_SCHEMA_REQUESTED,
});

export const selectQuery = query => ({
  type: actions.PATIENT_VARIANT_QUERY_SELECTION,
  payload: {
    query,
  },
});

export const replaceQuery = query => ({
  type: actions.PATIENT_VARIANT_QUERY_REPLACEMENT,
  payload: {
    query,
  },
});

export const replaceQueries = queries => ({
  type: actions.PATIENT_VARIANT_QUERIES_REPLACEMENT,
  payload: {
    queries,
  },
});

export const removeQuery = key => ({
  type: actions.PATIENT_VARIANT_QUERY_REMOVAL,
  payload: {
    key,
  },
});

export const duplicateQuery = (query, index) => ({
  type: actions.PATIENT_VARIANT_QUERY_DUPLICATION,
  payload: {
    query,
    index,
  },
});

export const sortStatement = statement => ({
  type: actions.PATIENT_VARIANT_STATEMENT_SORT,
  payload: {
    statement,
  },
});

export const searchVariants = (patient, statement, query, group = null, index = 0, limit = 25) => ({
  type: actions.PATIENT_VARIANT_SEARCH_REQUESTED,
  payload: {
    patient,
    statement,
    query,
    group,
    index,
    limit,
  },
});
