import * as actions from './type';

export const fetchSchema = () => ({
  type: actions.VARIANT_SCHEMA_REQUESTED,
});

export const selectQuery = (key) => ({
  type: actions.PATIENT_VARIANT_QUERY_SELECTION,
  payload: {
    key,
  },
});

export const replaceQuery = (query) => ({
  type: actions.PATIENT_VARIANT_QUERY_REPLACEMENT,
  payload: {
    query,
  },
});

export const replaceQueries = (queries) => ({
  type: actions.PATIENT_VARIANT_QUERIES_REPLACEMENT,
  payload: {
    queries,
  },
});

export const removeQuery = (keys) => ({
  type: actions.PATIENT_VARIANT_QUERY_REMOVAL,
  payload: {
    keys,
  },
});

export const duplicateQuery = (query, index, count) => ({
  type: actions.PATIENT_VARIANT_QUERY_DUPLICATION,
  payload: {
    query,
    index,
    count,
  },
});

export const createQuery = () => ({
  type: actions.PATIENT_VARIANT_QUERY_CREATION_REQUESTED,
});

export const sortStatement = (statement) => ({
  type: actions.PATIENT_VARIANT_STATEMENT_SORT,
  payload: {
    statement,
  },
});

export const searchVariants = (patient, statement, query, index = 0, limit = 25, group = null) => ({
  type: actions.PATIENT_VARIANT_SEARCH_REQUESTED,
  payload: {
    patient,
    statement,
    query,
    index,
    limit,
    group,
  },
});

export const searchFacets = (patient, statement, query) => ({
  type: actions.PATIENT_VARIANT_FACET_REQUESTED,
  payload: {
    patient,
    statement,
    query,
  },
});

export const countVariants = (patient, statement, queries) => ({
  type: actions.PATIENT_VARIANT_COUNT_REQUESTED,
  payload: {
    patient,
    statement,
    queries,
  },
});

export const commitHistory = (version) => ({
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

export const createDraftStatement = (statement) => ({
  type: actions.PATIENT_VARIANT_CREATE_DRAFT_STATEMENT,
  payload: {
    statement,
  },
});

export const updateStatement = (id, title, description, queries) => ({
  type: actions.PATIENT_VARIANT_UPDATE_STATEMENT_REQUESTED,
  payload: {
    id,
    title,
    description,
    queries,
  },
});

export const createStatement = (id, title, description, queries) => ({
  type: actions.PATIENT_VARIANT_CREATE_STATEMENT_REQUESTED,
  payload: {
    id,
    title,
    description,
    queries,
  },
});

export const deleteStatement = (id) => ({
  type: actions.PATIENT_VARIANT_DELETE_STATEMENT_REQUESTED,
  payload: {
    id,
  },
});

export const selectStatement = (id) => ({
  type: actions.PATIENT_VARIANT_SELECT_STATEMENT_REQUESTED,
  payload: {
    id,
  },
});

export const duplicateStatement = (id) => ({
  type: actions.PATIENT_VARIANT_DUPLICATE_STATEMENT_REQUESTED,
  payload: {
    id,
  },
});

export const fetchGenesByAutocomplete = (query, type = 'partial') => ({
  type: actions.PATIENT_VARIANT_FETCH_GENES_BY_AUTOCOMPLETE_REQUESTED,
  payload: {
    type,
    query,
  },
});

export const updateVariantColumns = (columns) => ({
  type: actions.PATIENT_VARIANT_UPDATE_COLUMNS,
  payload: {
    columns,
  },
});

export const updateVariantColumnsOrder = (columnsOrder) => ({
  type: actions.PATIENT_VARIANT_UPDATE_COLUMNS_ORDER,
  payload: {
    columnsOrder,
  },
});

export const resetColumns = () => ({
  type: actions.PATIENT_VARIANT_RESET_COLUMNS_REQUESTED,
});
