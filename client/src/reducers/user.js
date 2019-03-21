/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';

export const initialUserState = {
  username: null,
};

export const userShape = {
  username: PropTypes.string,
};

const userReducer = (state = initialUserState, action) => produce(state, (draft) => { // eslint-disable-line no-unused-vars, max-len
  switch (action.type) {
    case actions.USER_LOGIN_FAILED:
    case actions.USER_LOGOUT_SUCCEEDED:
      draft.username = initialUserState.username;
      break;

    case actions.USER_LOGIN_SUCCEEDED:
      draft.username = action.payload.data.data.user.username;
      break;

    default:
      break;
  }
});

export default userReducer;
