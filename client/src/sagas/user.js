import { all, put, takeLatest } from 'redux-saga/effects';

import * as actions from '../actions/type';
import { success, error } from '../actions/app';
import Api, { ApiError } from '../helpers/api';
import LocalStore from '../helpers/storage/local';


function* login(action) {
  try {
    yield put({ type: actions.START_LOADING_ANIMATION });
    const response = yield Api.login(action.payload.username, action.payload.password);
    if (response.error) {
      throw new ApiError(response.error);
    }
    yield put({ type: actions.USER_LOGIN_SUCCEEDED, payload: response.payload });
    const redirect = LocalStore.read(LocalStore.keys.location);
    if (redirect) {
      LocalStore.remove(LocalStore.keys.location);
      yield put({ type: actions.ROUTER_NAVIGATION_REQUESTED, payload: { location: redirect } });
    } else {
      yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED });
    }
  } catch (e) {
    yield put({ type: actions.USER_LOGIN_FAILED, payload: e });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* logout() {
  try {
    yield put({ type: actions.START_LOADING_ANIMATION });
    const response = yield Api.logout();
    if (response.error) {
      throw new ApiError(response.error);
    }
    LocalStore.remove(LocalStore.keys.location);
    yield put({ type: actions.USER_LOGOUT_SUCCEEDED });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_LOGOUT_FAILED, payload: e });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* recover(action) {
  try {
    yield put({ type: actions.START_LOADING_ANIMATION });
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.USER_RECOVERY_SUCCEEDED, payload: action.payload });
    yield put(success(window.CLIN.translate({ id: 'message.success.generic' })));
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_RECOVERY_FAILED, payload: e });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* fetch(action) {
  try {
    yield put({ type: actions.START_LOADING_ANIMATION });
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.USER_FETCH_SUCCEEDED, payload: action.payload });
    yield put(success(window.CLIN.translate({ id: 'message.success.generic' })));
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_FETCH_FAILED, payload: e });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* watchUserLogin() {
  yield takeLatest(actions.USER_LOGIN_REQUESTED, login);
}

function* watchUserLogout() {
  yield takeLatest(actions.USER_LOGOUT_REQUESTED, logout);
}

function* watchUserRecover() {
  yield takeLatest(actions.USER_RECOVERY_REQUESTED, recover);
}

function* watchUserFetch() {
  yield takeLatest(actions.USER_FETCH_REQUESTED, fetch);
}

export default function* watchedUserSagas() {
  yield all([
    watchUserLogin(),
    watchUserRecover(),
    watchUserFetch(),
    watchUserLogout(),
  ]);
}
