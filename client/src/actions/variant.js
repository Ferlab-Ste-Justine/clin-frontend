import * as actions from './type';


export const fetchSchema = () => ({
  type: actions.VARIANT_SCHEMA_REQUESTED,
});

export const selectQuery = key => ({
  type: actions.PATIENT_VARIANT_QUERY_SELECTION,
  payload: {
    key,
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

export const removeQuery = keys => ({
  type: actions.PATIENT_VARIANT_QUERY_REMOVAL,
  payload: {
    keys,
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

export const commitHistory = version => ({
  type: actions.PATIENT_VARIANT_COMMIT_HISTORY,
  payload: {
    version,
  },
});

export const undo = () => ({
  type: actions.PATIENT_VARIANT_UNDO,
});


export const getStatements = () => ({
  type: actions.PATIENT_VARIANT_GET_STATEMENTS_REQUESTED,
});


// TODO actions.PATIENT_VARIANT_CREATE_STATEMENT
export const createStatement = (query, title, description) => ({
  type: actions.PATIENT_VARIANT_CREATE_STATEMENTS_REQUESTED,
  payload: {
    query, title, description,
  },
});

// TODO actions.PATIENT_VARIANT_UPDATE_STATEMENT
export const updateStatement = (uid, query, title, description, isDefault) => ({
  type: actions.PATIENT_VARIANT_UPDATE_STATEMENT_REQUESTED,
  payload: {
    uid, query, title, description, isDefault,
  },
});


// TODO actions.PATIENT_VARIANT_UPDATE_STATEMENT_MAKE_DEFAULT


// TODO actions.PATIENT_VARIANT_DELETE_STATEMENT
export const deleteStatement = uid => ({
  type: actions.PATIENT_VARIANT_DELETE_STATEMENT_REQUESTED,
  payload: {
    uid,
  },
});
