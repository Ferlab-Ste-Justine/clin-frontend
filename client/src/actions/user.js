import * as actions from './type';

export const logoutUser = () => ({
  type: actions.USER_LOGOUT_REQUESTED,
});

export const getUserProfile = () => ({
  type: actions.USER_PROFILE_REQUESTED,
});

export const getUserIdentity = () => ({
  type: actions.USER_IDENTITY_REQUESTED,
});

export const updateUserProfile = (id, defaultStatement, patientTableConfig) => ({
  payload: {
    defaultStatement,
    id,
    patientTableConfig,
  },
  type: actions.USER_PROFILE_UPDATE_REQUESTED,
});

export const updateAuthPermissions = () => ({
  type: actions.UPDATE_USER_AUTH_PERMISSIONS_REQUESTED,
});
