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
  type: actions.USER_PROFILE_UPDATE_REQUESTED,
  payload: {
    id,
    defaultStatement,
    patientTableConfig,
  },
});

export const updateUserColumns = (columns) => ({
  type: actions.USER_PROFILE_UPDATE_COLUMNS,
  payload: {
    columns,
  },
});

export const updateUserColumnsOrder = (columnsOrder) => ({
  type: actions.USER_PROFILE_UPDATE_COLUMNS_ORDER,
  payload: {
    columnsOrder,
  },
});

export const updateUserColumnsReset = () => ({
  type: actions.USER_PROFILE_UPDATE_COLUMNS_RESET_REQUESTED,
});

export const updateAuthPermissions = () => ({
  type: actions.UPDATE_USER_AUTH_PERMISSIONS_REQUESTED,
});
