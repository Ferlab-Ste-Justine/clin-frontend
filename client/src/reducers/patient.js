/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';

// import * as actions from '../actions/type';

export const initialPatientState = {
  uid: null,
};

export const patientShape = {
  uid: PropTypes.string,
};

const patientReducer = (state = initialPatientState, action) => produce(state, (draft) => { // eslint-disable-line no-unused-vars, max-len
  switch (action.type) {
    default:
      break;
  }
});

export default patientReducer;
