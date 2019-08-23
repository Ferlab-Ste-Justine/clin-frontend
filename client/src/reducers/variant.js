/* eslint-disable no-param-reassign, import/no-cycle */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';


export const initialVariantState = {
  schema: {},
  results: [],
};

export const variantShape = {
  schema: PropTypes.shape({}),
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

    default:
      break;
  }
});

export default variantReducer;
