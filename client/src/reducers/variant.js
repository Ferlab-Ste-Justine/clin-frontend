/* eslint-disable  */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { isEqual, findIndex, last, cloneDeep } from 'lodash';
import uuidv1 from 'uuid/v1';

import * as actions from '../actions/type';
import { normalizePatientDetails } from '../helpers/struct';

const MAX_REVISIONS = 10;

function getUpdatedDraftHistory({ draftQueries, activeQuery, draftHistory }) {
  const newCommit = {
    activeQuery,
    draftQueries
  };
  const lastVersionInHistory = last(draftHistory)
  const newDraftHistory = [
    ...draftHistory,
    ...!isEqual(newCommit, lastVersionInHistory) ? [newCommit] : []
  ]
  const revisions = draftHistory.length;
  if (revisions > MAX_REVISIONS) {
    newDraftHistory.shift();
  }
  return newDraftHistory;
}

export const initialVariantState = {
  schema: {},
  activePatient: null,
  activeQuery: null,
  originalQueries: [],
  draftQueries: [],
  draftHistory: [],
  matches: {},
  results: {},
  facets: {},
};

export const variantShape = {
  schema: PropTypes.shape({}),
  activePatient: PropTypes.String,
  activeQuery: PropTypes.String,
  originalQueries: PropTypes.array,
  draftQueries: PropTypes.array,
  draftHistory: PropTypes.array,
  matches: PropTypes.shape({}),
  results: PropTypes.shape({}),
  facets: PropTypes.shape({}),
};

const variantReducer = (state = Object.assign({}, initialVariantState), action) => produce(state, (draft) => {
  const { draftQueries, draftHistory } = draft;

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
      draft.originalQueries = [];
      draft.draftQueries = [];
      draft.activeQuery = null;
      break;

    case actions.PATIENT_VARIANT_QUERY_NEW:
      draft.draftHistory = getUpdatedDraftHistory(cloneDeep(draft));
      const key = uuidv1()
      draft.draftQueries = [
        ...draft.draftQueries,
        {
          key,
          instructions: []
        }
      ];
      draft.activeQuery = key;
      break;

    case actions.PATIENT_VARIANT_QUERY_SELECTION:
      if (typeof action.payload.key !== 'undefined') {
        draft.activeQuery = action.payload.key;
      }
      break;

    case actions.PATIENT_VARIANT_SEARCH_SUCCEEDED:
      draft.matches[action.payload.data.query] = action.payload.data.total;
      draft.facets[action.payload.data.query] = action.payload.data.facets;
      draft.results[action.payload.data.query] = action.payload.data.hits;
      break;

    case actions.PATIENT_VARIANT_SEARCH_FAILED:
      draft.facets[action.payload.data.query] = {}
      draft.matches[action.payload.data.query] = {}
      draft.results[action.payload.data.query] = {}
      break;

    case actions.PATIENT_VARIANT_QUERY_REMOVAL:
      draft.draftQueries = draftQueries.filter((query) => !Boolean(action.payload.keys.find((key) => key === query.key)));
      draft.activeQuery = draft.draftQueries.find((query) => query.key === draft.activeQuery) ? draft.activeQuery : draft.draftQueries[0].key;
      break;

    case actions.PATIENT_VARIANT_QUERY_DUPLICATION:
      draft.draftHistory = getUpdatedDraftHistory(cloneDeep(draft));
      const keyToDuplicate = action.payload.query.key;
      const indexToInsertAt = action.payload.index || draft.draftQueries.length;
      const indexToDuplicate = findIndex(draftQueries, { key: keyToDuplicate })
      if (indexToDuplicate) {
        draft.draftQueries.splice(indexToInsertAt, 0, action.payload.query);
        draft.activeQuery = action.payload.query.key
      }
      break;

    case actions.PATIENT_VARIANT_QUERY_REPLACEMENT:
      draft.draftHistory = getUpdatedDraftHistory(cloneDeep(draft));
      const { query } = action.payload;
      const index = findIndex(draftQueries, { key: query.key })
      if (index > -1) {
        draftQueries[index] = query
      } else {
        draftQueries.push(query)
      }
      draft.draftQueries = draftQueries
      draft.activeQuery = query.key
      break;
    
    case actions.PATIENT_VARIANT_QUERIES_REPLACEMENT:
      draft.draftHistory = getUpdatedDraftHistory(cloneDeep(draft));
      const { queries, activeQuery } = action.payload;
      draft.draftQueries = queries
      draft.activeQuery = activeQuery || queries[0];
      break;

    case actions.PATIENT_VARIANT_STATEMENT_SORT:
      draft.draftHistory = getUpdatedDraftHistory(cloneDeep(draft));
      const { statement } = action.payload;
      draft.draftQueries = statement
      break;

    case actions.PATIENT_VARIANT_UNDO:
      const lastVersion = draftHistory.pop();
      draft.draftQueries = lastVersion.draftQueries;
      draft.activeQuery = lastVersion.activeQuery;

    default:
      break;
  }
});

export default variantReducer;
