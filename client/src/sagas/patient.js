/* eslint-disable */

import {
  all, put, debounce, takeLatest,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import { error } from '../actions/app';
import Api, { ApiError } from '../helpers/api';


function* fetch(action) {
  try {
    yield put({ type: actions.START_LOADING_ANIMATION });
    const patientResponse = yield Api.getPatientById(action.payload.uid);
    if (patientResponse.error) {
      throw new ApiError(patientResponse.error);
    }
    yield put({ type: actions.PATIENT_FETCH_SUCCEEDED, payload: patientResponse.payload.data });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.PATIENT_FETCH_FAILED, payload: e });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* autoComplete(action) {
  try {
    const response = yield Api.getPatientsByAutoComplete(
      action.payload.type,
      action.payload.query,
      action.payload.page,
      action.payload.size
    );

    if (response.error) {
      throw new ApiError(response.error);
    }
    yield put({ type: actions.PATIENT_AUTOCOMPLETE_SUCCEEDED, payload: response.payload });
    if (action.payload.type !== 'partial') {
      yield put({ type: actions.PATIENT_SEARCH_SUCCEEDED, payload: response.payload });
    }
  } catch (e) {
    yield put({ type: actions.PATIENT_AUTOCOMPLETE_FAILED, payload: e });
  }
}

function* search(action) {
  try {
    let response = null;

    if (!action.payload.query) {
      response = yield Api.getAllPatients(action.payload.page, action.payload.size);
    } else {
      response = yield Api.searchPatients(action.payload.query, action.payload.page, action.payload.size);
    }
    if (response.error) {
      throw new ApiError(response.error);
    }
    yield put({ type: actions.PATIENT_SEARCH_SUCCEEDED, payload: response.payload });
  } catch (e) {
    yield put({ type: actions.PATIENT_SEARCH_FAILED, payload: e });
  }
}

function* watchPatientFetch() {
  yield takeLatest(actions.PATIENT_FETCH_REQUESTED, fetch);
}

function* debouncePatientAutoComplete() {
  yield debounce(250, actions.PATIENT_AUTOCOMPLETE_REQUESTED, autoComplete);
}

function* watchPatientSearch() {
  yield takeLatest(actions.PATIENT_SEARCH_REQUESTED, search);
}

export default function* watchedPatientSagas() {
  yield all([
    watchPatientFetch(),
    debouncePatientAutoComplete(),
    watchPatientSearch(),
  ]);
}
