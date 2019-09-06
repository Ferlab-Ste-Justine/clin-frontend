/* eslint-disable no-param-reassign, import/no-cycle, no-case-declarations */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { cloneDeep } from 'lodash';

import * as actions from '../actions/type';
import { normalizePatientDetails } from '../helpers/struct';

const exampleQuery = {
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

export const initialVariantState = {
  schema: {},
  activePatient: null,
  activeQuery: null,
  queries: [
    cloneDeep(exampleQuery),
    cloneDeep(exampleQuery),
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

    default:
      break;
  }
});

export default variantReducer;
