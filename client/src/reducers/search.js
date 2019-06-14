/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';

// import * as actions from '../actions/type';

export const initialSearchState = {
  patient: {
    query: null,
    results: [],
    total: 0,
  },
};

export const searchShape = {
  patient: PropTypes.shape({
    query: PropTypes.string,
    results: PropTypes.array,
    total: PropTypes.number,
  }),
};

const searchReducer = (state = initialSearchState, action) => produce(state, (draft) => { // eslint-disable-line no-unused-vars, max-len
  switch (action.type) {
    default:
      break;
  }
});

export default searchReducer;
