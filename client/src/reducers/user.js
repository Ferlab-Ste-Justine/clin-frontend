import PropTypes from 'prop-types';
import { produce } from 'immer';

import get from 'lodash/get';
import * as actions from '../actions/type';

export const initialUserState = {
  username: null,
  firstName: null,
  lastName: null,
  practitionerId: null,
  profile: {
    uid: null,
    defaultStatement: null,
    patientTableConfig: {},
    variantTableConfig: {},
  },
  practitionerData: {
    practitioner: null,
    practitionerRole: null,
  },
  permissions: null,
};

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

const userReducer = (state = ({ ...initialUserState }), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.USER_LOGOUT_SUCCEEDED:
    case actions.USER_IDENTITY_FAILED:
      draft.username = null;
      break;

    case actions.USER_IDENTITY_SUCCEEDED:
      draft.username = action.payload.preferred_username;
      draft.firstName = action.payload.given_name;
      draft.lastName = action.payload.family_name;
      draft.practitionerId = get(action.payload, 'attributes.fhir_practitioner_id[0]', '');
      break;

    case actions.USER_PROFILE_SUCCEEDED:
      draft.profile.uid = action.payload.data.hits[0]._id;
      draft.profile.defaultStatement = action.payload.data.hits[0]._source.defaultStatement;
      draft.profile.patientTableConfig = JSON.parse(action.payload.data.hits[0]._source.patientTableConfig);
      draft.profile.variantTableConfig = JSON.parse(action.payload.data.hits[0]._source.variantTableConfig);
      draft.practitionerData.practitionerRole = action.payload.practitionerData.practitionerRole;
      draft.practitionerData.practitioner = action.payload.practitionerData.practitioner;
      break;

    case actions.USER_PROFILE_UPDATE_SUCCEEDED:
      draft.profile.defaultStatement = action.payload.data.defaultStatement;
      draft.profile.patientTableConfig = JSON.parse(action.payload.data.patientTableConfig);
      draft.profile.variantTableConfig = JSON.parse(action.payload.data.variantTableConfig);
      break;

    case actions.UPDATE_USER_AUTH_PERMISSIONS_SUCCEEDED:
      draft.permissions = action.payload.permissions;
      break;

    default:
      break;
  }
});

export default userReducer;
