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

export const fetchUser = uid => ({
  type: actions.USER_FETCH_REQUESTED,
  payload: uid,
});
