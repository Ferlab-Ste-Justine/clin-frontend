import { all, put, takeLatest } from 'redux-saga/effects';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';


function* login(action) {
  try {
    const response = yield Api.login(action.payload.username, action.payload.password);
    if (response.error) {
      throw new ApiError(response.error);
    }

    yield put({ type: actions.USER_LOGIN_SUCCEEDED, payload: response.payload });
    yield put({ type: actions.USER_PROFILE_REQUESTED });
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED });
  } catch (e) {
    yield put({ type: actions.USER_LOGIN_FAILED, payload: e });
  }
}

function* logout() {
  try {
    const response = yield Api.logout();
    if (response.error) {
      throw new ApiError(response.error);
    }
    yield put({ type: actions.USER_LOGOUT_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.USER_LOGOUT_FAILED, payload: e });
  }
}

function* recover(action) {
  try {
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.USER_RECOVERY_SUCCEEDED, payload: action.payload });
  } catch (e) {
    yield put({ type: actions.USER_RECOVERY_FAILED, payload: e });
  }
}

function* getUserProfile() {
  try {
    let response = yield Api.getUserProfile();
    if (response.error) {
      throw new ApiError(response.error);
    }

    if (response.payload.data.data.total === 0) {
      response = yield Api.createUserProfile();
      if (response.error) {
        throw new ApiError(response.error);
      }
    }

    yield put({ type: actions.USER_PROFILE_SUCCEEDED, payload: response.payload.data });
  } catch (e) {
    yield put({ type: actions.USER_PROFILE_FAILED, payload: e });
  }
}

function* updateUserProfile(action) {
  try {
    const defaultStatement = action.payload.defaultStatement ? action.payload.defaultStatement : '';
    const patientTableConfig = action.payload.patientTableConfig ? action.payload.patientTableConfig : {};
    const variantTableConfig = action.payload.variantTableConfig ? action.payload.variantTableConfig : {};
    const statementResponse = yield Api.updateUserProfile(action.payload.id, defaultStatement, patientTableConfig, variantTableConfig);
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }

    yield put({ type: actions.USER_PROFILE_UPDATE_SUCCEEDED, payload: statementResponse.payload.data });
  } catch (e) {
    yield put({ type: actions.USER_PROFILE_UPDATE_FAILED, payload: e });
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

function* watchGetUserProfile() {
  yield takeLatest(actions.USER_PROFILE_REQUESTED, getUserProfile);
}

function* watchUpdateUserProfile() {
  yield takeLatest(actions.USER_PROFILE_UPDATE_REQUESTED, updateUserProfile);
}

export default function* watchedUserSagas() {
  yield all([
    watchUserLogin(),
    watchUserRecover(),
    watchUserLogout(),
    watchGetUserProfile(),
    watchUpdateUserProfile(),
  ]);
}
