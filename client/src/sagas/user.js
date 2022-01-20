import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';
import keycloak from '../keycloak';

function* logout() {
  try {
    const response = yield keycloak.logout();
    if (response.error) {
      throw new ApiError(response.error);
    }

    yield put({ type: actions.USER_LOGOUT_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.USER_LOGOUT_FAILED, payload: e });
  }
}

function* identity() {
  try {
    const response = yield keycloak.loadUserInfo();
    yield put({ type: actions.USER_IDENTITY_SUCCEEDED, payload: response });
  } catch (e) {
    yield put({ type: actions.USER_IDENTITY_FAILED, payload: e });
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
      yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED });
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
    const statementResponse = yield Api.updateUserProfile(
      action.payload.id, defaultStatement, patientTableConfig
    );
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }

    yield put({ type: actions.USER_PROFILE_UPDATE_SUCCEEDED, payload: statementResponse.payload.data });
  } catch (e) {
    yield put({ type: actions.USER_PROFILE_UPDATE_FAILED, payload: e });
  }
}

function* updateUserAuthPermissions() {
  try {
    const response = yield Api.getUserAuthPermissions();
    const permissions = response.payload.data.map((permission) => permission.rsname);
    permissions.sort();
    yield put({
      type: actions.UPDATE_USER_AUTH_PERMISSIONS_SUCCEEDED,
      payload: {
        permissions,
      },
    });
  } catch (e) {
    yield put({ type: actions.UPDATE_USER_AUTH_PERMISSIONS_FAILED });
  }
}

function* watchUserLogout() {
  yield takeLatest(actions.USER_LOGOUT_REQUESTED, logout);
}

function* watchUserIdentity() {
  yield takeLatest(actions.USER_IDENTITY_REQUESTED, identity);
}

function* watchGetUserProfile() {
  yield takeLatest(actions.USER_PROFILE_REQUESTED, getUserProfile);
}

function* watchUpdateUserProfile() {
  yield takeLatest(actions.USER_PROFILE_UPDATE_REQUESTED, updateUserProfile);
}

function* watchUpdateUserAuthPermissions() {
  yield takeLatest(actions.UPDATE_USER_AUTH_PERMISSIONS_REQUESTED, updateUserAuthPermissions);
}

export default function* watchedUserSagas() {
  yield all([
    watchUserIdentity(),
    watchUserLogout(),
    watchGetUserProfile(),
    watchUpdateUserProfile(),
    watchUpdateUserAuthPermissions(),
  ]);
}
