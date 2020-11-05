import * as actions from './type';

export const logoutUser = () => ({
  type: actions.USER_LOGOUT_REQUESTED,
});

export const getUserProfile = () => ({
  type: actions.USER_PROFILE_REQUESTED,
});

export const updateUserProfile = (id, defaultStatement, patientTableConfig, variantTableConfig) => ({
  type: actions.USER_PROFILE_UPDATE_REQUESTED,
  payload: {
    id,
    defaultStatement,
    patientTableConfig,
    variantTableConfig,
  },
});

export const updateUserColumns = columns => ({
  type: actions.USER_PROFILE_UPDATE_COLUMNS,
  payload: {
    columns,
  },
});

export const updateUserColumnsOrder = columnsOrder => ({
  type: actions.USER_PROFILE_UPDATE_COLUMNS_ORDER,
  payload: {
    columnsOrder,
  },
});
