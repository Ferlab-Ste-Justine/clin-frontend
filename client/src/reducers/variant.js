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
        operand: 'all',
        values: ['SNP', 'DNP', 'TNP', 'ONP', 'INS', 'DEL'],
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
        values: ['complementary', 'duplicate', 'polymeric', 'modifying', 'lethal', 'moveable'],
      },
    },
  ],
};
const exampleQueryB = cloneDeep(exampleQueryA)
exampleQueryB.key = 'zdcb83a1-dfa5-11e9-96aa-c957343d6d72'

/*
[
  {
    title: 'Query 1',
    instructions: [
      {
        type: 'filter',
        data: {
          id: 'variant_type',
          type: 'generic',
          operand: 'all',
          values: ['SNP', 'DNP', 'TNP', 'ONP', 'INS', 'DEL'],
        }
      },
      {
        type: 'operator',
        data: {
          type: 'and',
        }
      },
      {
        type: 'filter',
        data: {
          id: 'gene_type',
          type: 'generic',
          operand: 'all',
          values: ['complementary', 'duplicate', 'polymeric', 'modifying', 'lethal', 'moveable'],
        }
      }
    ]
  }
]
*/



export const initialVariantState = {
  schema: {},
  activePatient: null,
  activeQuery: null,
  queries: [
    cloneDeep(exampleQueryA),
    cloneDeep(exampleQueryB),
  ],
  results: [],
};

export const variantShape = {
  schema: PropTypes.shape({}),
  activePatient: PropTypes.String,
  activeQuery: PropTypes.String,
  queries: PropTypes.array,
  results: PropTypes.array,
};

const variantReducer = (state = Object.assign({}, initialVariantState), action) => produce(state, (draft) => {
  const { queries } = draft;

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
      draft.activeQuery = null;
      break;

    case actions.PATIENT_VARIANT_QUERY_SELECTION:
      draft.activeQuery = action.payload.query.key;
      break;

    case actions.PATIENT_VARIANT_QUERY_REMOVAL:
      const keyToRemove = action.payload.query.key;
      draft.queries = queries.filter((query) => {
        return query.key !== keyToRemove;
      })
      break;

    case actions.PATIENT_VARIANT_QUERY_DUPLICATION:
      const keyToDuplicate = action.payload.query.key;
      const indexToInsertAt = action.payload.index || draft.queries.length;
      const indexToDuplicate = findIndex(queries, { key: keyToDuplicate })
      if (indexToDuplicate) {
        draft.queries.splice(indexToInsertAt, 0, action.payload.query);
        draft.activeQuery = action.payload.query.key
      }
      break;

    case actions.PATIENT_VARIANT_QUERY_REPLACEMENT:
      const { query } = action.payload;
      const index = findIndex(queries, { key: query.key })
      if (index > -1) {
        queries[index] = query
      }
      draft.queries = queries
      break;






    default:
      break;
  }
});

export default variantReducer;
