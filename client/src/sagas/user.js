import { put, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions/type';
// import Api from '../helpers/api';

// @TODO
export function* authUser(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    const user = { username: action.payload.username };
    yield put({ type: actions.USER_AUTHENTICATION_SUCCEEDED, payload: user });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_AUTHENTICATION_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

// @TODO
export function* invalidateUser() {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.USER_INVALIDATION_SUCCEEDED });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_INVALIDATION_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

// @TODO
export function* userAuthRecovery(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
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
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
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

function* watchInvalidateUser() {
  yield takeLatest(actions.USER_INVALIDATION_REQUESTED, invalidateUser);
}

function* watchUserAuthRecovery() {
  yield takeLatest(actions.USER_PASSWORD_RECOVERY_REQUESTED, userAuthRecovery);
}

function* watchFetchUser() {
  yield takeLatest(actions.USER_FETCH_REQUESTED, fetchUser);
}

export default {
  authenticateUserSaga: watchAuthUser,
  invalidateUserSaga: watchInvalidateUser,
  userPasswordRecoverySaga: watchUserAuthRecovery,
  loadUserDataSaga: watchFetchUser,
};
