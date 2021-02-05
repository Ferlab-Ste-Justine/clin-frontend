/* eslint-disable no-param-reassign, no-underscore-dangle */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';

export const initialVariantDetailsState = {
  variantID: null,
};

// @TODO
export const variantDetailsShape = {
  data: PropTypes.shape({}),
};

const variantDetailsReducer = (state = ({ ...initialVariantDetailsState }), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.VARIANT_ID_SET:
      draft.variantID = action.payload;
      break;
    case actions.VARIANT_DETAILS_SUCCEEDED:
      draft.data = action.payload;
      break;
    case actions.USER_LOGOUT_SUCCEEDED:
      break;
    default:
      break;
  }
});

export default variantDetailsReducer;
