import * as actions from './type';

export const loadApp = () => ({
  type: actions.APP_FETCH_REQUESTED,
});

export const changeLanguage = language => ({
  type: actions.APP_CHANGE_LANGUAGE_REQUESTED,
  payload: {
    language,
  },
});

export const success = message => ({
  type: actions.NOTIFICATION,
  payload: {
    type: 'success',
    message,
  },
});

export const error = message => ({
  type: actions.NOTIFICATION,
  payload: {
    type: 'error',
    message,
  },
});

export const warning = message => ({
  type: actions.NOTIFICATION,
  payload: {
    type: 'warning',
    message,
  },
});
