/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';

export const initialUserState = {
  username: null,
  firstName: null,
  lastName: null,
};

export const userShape = {
  username: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
};

const userReducer = (state = initialUserState, action) => produce(state, (draft) => { // eslint-disable-line no-unused-vars, max-len
  switch (action.type) {
    case actions.USER_LOGIN_FAILED:
    case actions.USER_LOGOUT_SUCCEEDED:
    case actions.USER_LOGOUT_FAILED:
      draft.username = initialUserState.username;
      draft.firstName = initialUserState.firstName;
      draft.lastName = initialUserState.lastName;
      break;

    case actions.USER_LOGIN_SUCCEEDED:
      draft.username = action.payload.data.data.user.username;
      draft.firstName = action.payload.data.data.user.firstName;
      draft.lastName = action.payload.data.data.user.lastName;
      break;

    default:
      break;
  }
});

export default userReducer;
