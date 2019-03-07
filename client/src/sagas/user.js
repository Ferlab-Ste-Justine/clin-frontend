import { put, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions/type';

// @TODO
export function* authUser(action) {
  console.log(action); // eslint-disable-line


  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    const user = { username: 'mock' };
    yield put({ type: actions.USER_AUTHENTICATION_SUCCEEDED, payload: user });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_AUTHENTICATION_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

// @TODO
export function* userAuthRecovery(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    const user = { action };
    yield put({ type: actions.USER_PASSWORD_RECOVERY_SUCCEEDED, payload: user });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_PASSWORD_RECOVERY_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

// @TODO
export function* fetchUser(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    const user = { action };
    yield put({ type: actions.USER_FETCH_SUCCEEDED, payload: user });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_FETCH_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* watchAuthUser() {
  yield takeLatest(actions.USER_AUTHENTICATION_REQUESTED, authUser);
}

function* watchUserAuthRecovery() {
  yield takeLatest(actions.USER_PASSWORD_RECOVERY_REQUESTED, userAuthRecovery);
}

function* watchFetchUser() {
  yield takeLatest(actions.USER_FETCH_REQUESTED, fetchUser);
}

export default {
  authenticateUserSaga: watchAuthUser,
  userPasswordRecoverySaga: watchUserAuthRecovery,
  loadUserDataSaga: watchFetchUser,
};
