import * as actions from './type';

export const authUser = (username, password) => ({
  type: actions.USER_AUTHENTICATION_REQUESTED,
  payload: {
    username,
    password,
  },
});

export const userPasswordRecovery = username => ({
  type: actions.USER_PASSWORD_RECOVERY_REQUESTED,
  payload: {
    username,
  },
});

export const fetchUser = uid => ({
  type: actions.USER_FETCH_REQUESTED,
  payload: uid,
});

export const updateUser = () => ({});
