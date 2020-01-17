/* eslint-disable  */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import {
  cloneDeep, findIndex, isEqual, last, remove,
} from 'lodash';
import uuidv1 from 'uuid/v1';

import * as actions from '../actions/type';
import { normalizePatientDetails } from '../helpers/struct';

const MAX_REVISIONS = 10;

export const initialVariantState = {
  schema: {},
  activePatient: null,
  activeQuery: null,
  originalQueries: [],
  draftQueries: [],
  draftHistory: [],
  results: {},
  facets: {},
  statements: {},
  activeStatementId: null,
  activeStatementTotals: {},
};

// @TODO
export const variantShape = {
  schema: PropTypes.shape({}),
  activePatient: PropTypes.String,
  activeQuery: PropTypes.String,
  originalQueries: PropTypes.array,
  draftQueries: PropTypes.array,
  draftHistory: PropTypes.array,
  results: PropTypes.shape({}),
  facets: PropTypes.shape({}),
  statements: PropTypes.shape({}),
  activeStatementId: PropTypes.String,
  activeStatementTotals: PropTypes.shape({}),
};

export const DRAFT_STATEMENT_UID = 'draft';
const createDraftStatement = (title = 'Draft', description = '', queries = null) => ({
  uid: DRAFT_STATEMENT_UID,
  title,
  description,
  queries: queries ? queries : [{ key: uuidv1(), instructions: [] }],
  isDefault: false,
})

const variantReducer = (state = Object.assign({}, initialVariantState), action) => produce(state, (draft) => {
  const { draftQueries, draftHistory } = draft;
  const { payload } = action;

  switch (action.type) {
    case actions.USER_LOGOUT_SUCCEEDED:
    case actions.USER_SESSION_HAS_EXPIRED:
      draft = Object.assign({}, initialVariantState);
      break;

    case actions.VARIANT_SCHEMA_SUCCEEDED:
      draft.schema = action.payload.data;
      break;

    case actions.PATIENT_FETCH_SUCCEEDED:
      const details = normalizePatientDetails(action.payload.data);
      draft.activePatient = details.id;
      const queryKey = uuidv1();
      draft.originalQueries = [{
        key: queryKey,
        instructions: [],
      }];
      draft.draftQueries = cloneDeep(draft.originalQueries);
      draft.activeQuery = queryKey;
      break;

    case actions.PATIENT_VARIANT_QUERY_SELECTION:
      if (action.payload.key) {
        draft.activeQuery = action.payload.key;
      }
      break;

    case actions.PATIENT_VARIANT_SEARCH_SUCCEEDED:
      draft.facets[action.payload.data.query] = action.payload.data.facets;
      draft.results[action.payload.data.query] = action.payload.data.hits;
      draft.activeStatementTotals[action.payload.data.query] = action.payload.data.total;
      break;

    case actions.PATIENT_VARIANT_SEARCH_FAILED:
      draft.facets[action.payload.data.query] = {};
      draft.results[action.payload.data.query] = {};
      break;

    case actions.PATIENT_VARIANT_COUNT_SUCCEEDED:
      Object.keys(action.payload.data.total).forEach((key) => {
        draft.activeStatementTotals[key] = action.payload.data.total[key];
      });
      break;

    case actions.PATIENT_VARIANT_QUERY_REMOVAL:
      draft.draftQueries = draftQueries.filter(query => !action.payload.keys.find(key => key === query.key));
      draft.activeQuery = draft.draftQueries.find(query => query.key === draft.activeQuery) ? draft.activeQuery : draft.draftQueries[0].key;
      break;

    case actions.PATIENT_VARIANT_QUERY_DUPLICATION:
      const keyToDuplicate = action.payload.query.key;
      const indexToInsertAt = action.payload.index || draft.draftQueries.length;
      const indexToDuplicate = findIndex(draft.draftQueries, { key: keyToDuplicate });
      if (indexToDuplicate) {
        draft.draftQueries.splice(indexToInsertAt, 0, action.payload.query);
        draft.activeQuery = action.payload.query.key;
      }
      break;

    case actions.PATIENT_VARIANT_QUERY_REPLACEMENT:
      const { query } = action.payload;
      const index = findIndex(draftQueries, { key: query.key });
      if (index > -1) {
        draftQueries[index] = query;
      } else {
        draftQueries.push(query);
      }
      draft.draftQueries = draftQueries;
      break;

    case actions.PATIENT_VARIANT_QUERIES_REPLACEMENT:
      const { queries } = action.payload;
      draft.draftQueries = queries;
      break;

    case actions.PATIENT_VARIANT_STATEMENT_SORT:
      const { statement } = action.payload;
      draft.draftQueries = statement;
      break;

    case actions.PATIENT_VARIANT_COMMIT_HISTORY:
      const { version } = action.payload;
      const newCommit = {
        activeQuery: draft.activeQuery,
        draftQueries: version,
      };
      const lastVersionInHistory = last(draftHistory);
      if (!isEqual(newCommit, lastVersionInHistory)) {
        draftHistory.push(newCommit);
      }
      const revisions = draftHistory.length;
      if (revisions > MAX_REVISIONS) {
        draftHistory.shift();
      }
      break;

    case actions.PATIENT_VARIANT_UNDO:
      const lastVersion = draftHistory.pop();
      draft.draftQueries = lastVersion.draftQueries;
      draft.activeQuery = lastVersion.activeQuery;
      break;

    case actions.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED:
      if (action.payload.data.total < 1) {
        draft.activeStatementId = DRAFT_STATEMENT_UID;
        draft.statements = {}
        draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement();
        draft.activeQuery = draft.statements.queries[0].key;
        draft.originalQueries = [];
        draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
        draft.draftHistory = [];
      } else {
        draft.statements = {}
        action.payload.data.hits.forEach(hit => (
          draft.statements[hit._id] = {
            uid: hit._id,
            title: hit._source.title,
            description: hit._source.description,
            queries: JSON.parse(hit._source.queries),
            isDefault: hit._source.isDefault,
          }
        ));
        const defaultStatementId = Object.keys(draft.statements).find(
          statementKey => draft.statements[statementKey].isDefault === true
        )
        if (defaultStatementId) {
          draft.activeStatementId = defaultStatementId
          draft.activeQuery = draft.statements[defaultStatementId].queries[(draft.statements[defaultStatementId].queries.length - 1)].key || null
        } else {
          draft.activeStatementId = DRAFT_STATEMENT_UID;
          draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement();
          draft.activeQuery = draft.statements[DRAFT_STATEMENT_UID].queries[0].key;
          draft.originalQueries = [];
          draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
          draft.draftHistory = [];
        }
      }
      break;

    case actions.PATIENT_VARIANT_SELECT_STATEMENT_SUCCEEDED:
      const statementId = action.payload.uid ? action.payload.uid : Object.keys(draft.statements).find(
        statementKey => draft.statements[statementKey].isDefault === true
      )
      draft.activeStatementId = statementId;
      draft.activeQuery = draft.statements[statementId].queries[draft.statements[statementId].queries.length - 1].key;
      draft.originalQueries = draft.statements[statementId].queries;
      draft.draftQueries = draft.statements[statementId].queries;
      draft.draftHistory = [];
      break;

    case actions.PATIENT_VARIANT_CREATE_STATEMENT_SUCCEEDED:
    case actions.PATIENT_VARIANT_UPDATE_STATEMENT_SUCCEEDED:
      draft.activeStatementId = action.payload.data.uid;
      draft.statements[action.payload.data.uid] = action.payload.data;
      draft.statements[action.payload.data.uid].queries = typeof action.payload.data.queries === 'string' ? JSON.parse(action.payload.data.queries) : action.payload.data.queries
      draft.activeQuery = draft.statements[action.payload.data.uid].queries[draft.statements[action.payload.data.uid].queries.length - 1].key;
      draft.originalQueries = cloneDeep(draft.statements[action.payload.data.uid].queries)
      draft.draftQueries = cloneDeep(draft.statements[action.payload.data.uid].queries)
      draft.draftHistory = [];
      break;

    case actions.PATIENT_VARIANT_DUPLICATE_STATEMENT_SUCCEEDED:
      draft.activeStatementId = DRAFT_STATEMENT_UID;
      draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(
        payload.statement.title,
        payload.statement.description,
        payload.statement.queries,
      )
      draft.activeQuery = draft.statements[DRAFT_STATEMENT_UID].queries[draft.statements[DRAFT_STATEMENT_UID].queries.length - 1].key;
      draft.originalQueries = [];
      draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
      draft.draftHistory = [];
      break;

    case actions.PATIENT_VARIANT_DELETE_STATEMENT_SUCCEEDED:
      delete draft.statements[action.payload.uid]
    case actions.PATIENT_VARIANT_CREATE_DRAFT_STATEMENT:
    case actions.PATIENT_VARIANT_GET_STATEMENTS_FAILED:
      draft.activeStatementId = DRAFT_STATEMENT_UID;
      draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement()
      draft.activeQuery = draft.statements[DRAFT_STATEMENT_UID].queries[0].key;
      draft.originalQueries = [];
      draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
      draft.draftHistory = [];
      break;

    default:
      break;
  }
});

export default variantReducer;
