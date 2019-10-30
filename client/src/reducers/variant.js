/* eslint-disable  */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { cloneDeep, isEqual, findIndex, last } from 'lodash';

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
      let queryKey = 'aggs';
      draft.originalQueries = [{
        key: queryKey,
        instructions: [],
      }];
      draft.draftQueries = cloneDeep(draft.originalQueries);
      draft.activeQuery = queryKey;
      break;

    case actions.PATIENT_VARIANT_QUERY_SELECTION:

      console.log(action.payload)

      if (action.payload.key) {
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
      const keyToDuplicate = action.payload.query.key;
      const indexToInsertAt = action.payload.index || draft.draftQueries.length;
      const indexToDuplicate = findIndex(draft.draftQueries, { key: keyToDuplicate })
      if (indexToDuplicate) {
        draft.draftQueries.splice(indexToInsertAt, 0, action.payload.query);
        draft.activeQuery = action.payload.query.key
      }
      break;

    case actions.PATIENT_VARIANT_QUERY_REPLACEMENT:
      const { query } = action.payload;
      const index = findIndex(draftQueries, { key: query.key })
      if (index > -1) {
        draftQueries[index] = query
      } else {
        draftQueries.push(query)
      }
      draft.draftQueries = draftQueries
      break;

    case actions.PATIENT_VARIANT_QUERIES_REPLACEMENT:
      const { queries } = action.payload;
      draft.draftQueries = queries
      break;

    case actions.PATIENT_VARIANT_STATEMENT_SORT:
      const { statement } = action.payload;
      draft.draftQueries = statement
      break;

    case actions.PATIENT_VARIANT_COMMIT_HISTORY:
      const { version } = action.payload;
      const newCommit = {
        activeQuery: draft.activeQuery,
        draftQueries: version
      };
      const lastVersionInHistory = last(draftHistory)
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

    default:
      break;
  }
});

export default variantReducer;
