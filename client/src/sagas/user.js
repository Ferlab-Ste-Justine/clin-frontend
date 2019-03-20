import { put, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions/type';
import Api from '../helpers/api';


function* login(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    const response = yield Api.login(action.payload.username, action.payload.password);

    console.log(response); // eslint-disable-line

    const user = {
      username: response.data.user,
    };
    yield put({ type: actions.USER_LOGIN_SUCCEEDED, payload: user });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_LOGIN_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* logout() {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    yield Api.logout();
    yield put({ type: actions.USER_LOGOUT_SUCCEEDED });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_LOGOUT_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* recover(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.USER_RECOVERY_SUCCEEDED, payload: action.payload });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_RECOVERY_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* fetch(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.USER_FETCH_SUCCEEDED, payload: action.payload });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.USER_FETCH_FAILED, message: e.message });
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

export default {
  userLoginSaga: watchUserLogin,
  userLogoutSaga: watchUserLogout,
  userRecoverSaga: watchUserRecover,
  userFetchSaga: watchUserFetch,
};
