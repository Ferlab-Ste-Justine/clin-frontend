import {
  all, put, debounce, takeLatest,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';

function* fetch(action) {
  try {
    const patientResponse = yield Api.getPatientById(action.payload.uid);
    if (patientResponse.error) {
      throw new ApiError(patientResponse.error);
    }
    yield put({ type: actions.PATIENT_FETCH_SUCCEEDED, payload: patientResponse.payload.data });
  } catch (e) {
    yield put({ type: actions.PATIENT_FETCH_FAILED, payload: e });
    yield put({ type: actions.USER_SESSION_HAS_EXPIRED });
  }
}

function* autoComplete(action) {
  const isAutocomplete = action.payload.type === 'partial';
  try {
    if (!isAutocomplete) {
      yield put({ type: actions.START_SUBLOADING_ANIMATION });
    }

    const response = yield Api.getPatientsByAutoComplete(
      action.payload.type,
      action.payload.query,
      action.payload.page,
      action.payload.size,
    );

    if (response.error) {
      throw new ApiError(response.error);
    }
    if (!isAutocomplete) {
      yield put({ type: actions.PATIENT_SEARCH_SUCCEEDED, payload: response.payload });
    } else {
      yield put({ type: actions.PATIENT_AUTOCOMPLETE_SUCCEEDED, payload: response.payload });
    }
  } catch (e) {
    if (!isAutocomplete) {
      yield put({ type: actions.PATIENT_SEARCH_FAILED });
    } else {
      yield put({ type: actions.PATIENT_AUTOCOMPLETE_FAILED, payload: e });
    }
  }
}

function* search(action) {
  try {
    let response = null;

    if (!action.payload.query) {
      response = yield Api.searchPatients(null, action.payload.page, action.payload.size);
    } else {
      response = yield Api.searchPatients(action.payload.query, action.payload.page, action.payload.size);
    }
    if (response.error) {
      throw new ApiError(response.error);
    }
    yield put({ type: actions.PATIENT_SEARCH_SUCCEEDED, payload: response.payload });
  } catch (e) {
    yield put({ type: actions.PATIENT_SEARCH_FAILED, payload: e });
    yield put({ type: actions.USER_SESSION_HAS_EXPIRED });
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
