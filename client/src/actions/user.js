import * as actions from './type';


export const loginUser = (username, password) => ({
  type: actions.USER_LOGIN_REQUESTED,
  payload: {
    username,
    password,
  },
});

export const logoutUser = () => ({
  type: actions.USER_LOGOUT_REQUESTED,
});

export const recoverUser = username => ({
  type: actions.USER_RECOVERY_REQUESTED,
  payload: {
    username,
  },
});

export const getUserProfile = () => ({
  type: actions.USER_PROFILE_REQUESTED,
});

export const checkUserSession = () => ({
  type: actions.USER_SESSION_CHECK_REQUESTED,
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
