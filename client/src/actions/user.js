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

export const updateUserProfile = (
  id,
  defaultStatement,
  patientTableConfig,
  variantTableConfig,
) => ({
  payload: {
    defaultStatement,
    id,
    patientTableConfig,
    variantTableConfig,
  },
  type: actions.USER_PROFILE_UPDATE_REQUESTED,
});

export const updateUserColumns = (columns) => ({
  payload: {
    columns,
  },
  type: actions.USER_PROFILE_UPDATE_COLUMNS,
});

export const updateUserColumnsOrder = (columnsOrder) => ({
  payload: {
    columnsOrder,
  },
  type: actions.USER_PROFILE_UPDATE_COLUMNS_ORDER,
});

export const updateUserColumnsReset = () => ({
  type: actions.USER_PROFILE_UPDATE_COLUMNS_RESET_REQUESTED,
});

export const updateAuthPermissions = () => ({
  type: actions.UPDATE_USER_AUTH_PERMISSIONS_REQUESTED,
});
