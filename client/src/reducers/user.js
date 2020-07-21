/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';


export const initialUserState = {
  username: null,
  firstName: null,
  lastName: null,
  profile: {
    uid: null,
    defaultStatement: null,
    patientTableConfig: {},
    variantTableConfig: {},
  },
};

// @TODO
export const userShape = {
  username: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  profile: PropTypes.shape({
    uid: PropTypes.string,
    defaultStatement: PropTypes.string,
    patientTableConfig: PropTypes.shape({}),
    variantTableConfig: PropTypes.shape({}),
  }),
};

const userReducer = (state = Object.assign({}, initialUserState), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.USER_LOGOUT_SUCCEEDED:
    case actions.USER_IDENTITY_FAILED:
      draft.username = null;
      break;

    case actions.USER_LOGIN_SUCCEEDED:
    case actions.USER_IDENTITY_SUCCEEDED:
      draft.username = action.payload.data.data.user.username;
      draft.firstName = action.payload.data.data.user.firstName;
      draft.lastName = action.payload.data.data.user.lastName;
      break;

    case actions.USER_PROFILE_SUCCEEDED:
      draft.profile.uid = action.payload.data.hits[0]._id;
      draft.profile.defaultStatement = action.payload.data.hits[0]._source.defaultStatement;
      draft.profile.patientTableConfig = JSON.parse(action.payload.data.hits[0]._source.patientTableConfig);
      draft.profile.variantTableConfig = JSON.parse(action.payload.data.hits[0]._source.variantTableConfig);
      break;

    case actions.USER_PROFILE_UPDATE_SUCCEEDED:
      draft.profile.defaultStatement = action.payload.data.defaultStatement;
      draft.profile.patientTableConfig = JSON.parse(action.payload.data.patientTableConfig);
      draft.profile.variantTableConfig = JSON.parse(action.payload.data.variantTableConfig);
      break;

    default:
      break;
  }
});

export default userReducer;
