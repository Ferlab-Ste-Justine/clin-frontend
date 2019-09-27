/* eslint-disable  */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { cloneDeep, findIndex, pull } from 'lodash';

import * as actions from '../actions/type';
import { normalizePatientDetails } from '../helpers/struct';

const exampleQueryA = {
  key: 'bdcb83a1-dfa5-11e9-96aa-c957343d6d71',
  title: 'Query 1',
  instructions: [
    {
      type: 'filter',
      data: {
        id: 'variant_type',
        type: 'generic',
        operand: 'one',
        values: ['SNV', 'insertion'],
      },
    },
    {
      type: 'operator',
      data: {
        type: 'and',
      },
    },
    {
      type: 'filter',
      data: {
        id: 'gene_type',
        type: 'generic',
        operand: 'all',
        values: ['protein_coding'],
      },
    },
  ],
};
const exampleQueryB = cloneDeep(exampleQueryA)
exampleQueryB.key = 'zdcb83a1-dfa5-11e9-96aa-c957343d6d72'


export const initialVariantState = {
  schema: {},
  activePatient: null,
  activeQuery: null,
  originalQueries: [],
  draftQueries: [],
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
  matches: PropTypes.shape({}),
  results: PropTypes.shape({}),
  facets: PropTypes.shape({}),
};

const variantReducer = (state = Object.assign({}, initialVariantState), action) => produce(state, (draft) => {
  const { draftQueries } = draft;

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
      draft.originalQueries = [
        cloneDeep(exampleQueryA),
        cloneDeep(exampleQueryB),
      ];
      draft.draftQueries = [
        cloneDeep(exampleQueryA),
        cloneDeep(exampleQueryB),
      ];
      draft.activeQuery = null;
      break;

    case actions.PATIENT_VARIANT_QUERY_SELECTION:
      draft.activeQuery = action.payload.query.key;
      break;

    case actions.PATIENT_VARIANT_SEARCH_SUCCEEDED:
      draft.matches[action.payload.data.query] = action.payload.data.total;
      draft.facets[action.payload.data.query] = action.payload.data.facets;
      draft.results[action.payload.data.query] = action.payload.data.hits;
      break;

    case actions.PATIENT_VARIANT_QUERY_REMOVAL:
      const keyToRemove = action.payload.query.key;
      draft.draftQueries = draftQueries.filter((query) => {
        return query.key !== keyToRemove;
      })
      break;

    case actions.PATIENT_VARIANT_QUERY_DUPLICATION:
      const keyToDuplicate = action.payload.query.key;
      const indexToInsertAt = action.payload.index || draft.draftQueries.length;
      const indexToDuplicate = findIndex(draftQueries, { key: keyToDuplicate })
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

    case actions.PATIENT_VARIANT_STATEMENT_SORT:
      const { statement, activeQuery } = action.payload;
      draft.draftQueries = statement
      draft.activeQuery = activeQuery
      break;

    default:
      break;
  }
});

export default variantReducer;
