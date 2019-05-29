import { all, put, takeLatest } from 'redux-saga/effects';

import * as actions from '../actions/type';
// import Api, { ApiError } from '../helpers/api';


function* fetch(action) {
  try {
    yield put({ type: actions.START_LOADING_ANIMATION });
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.PATIENT_SEARCH_SUCCEEDED, payload: action.payload });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.PATIENT_SEARCH_FAILED, payload: e });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* search(action) {
  try {
    yield put({ type: actions.START_LOADING_ANIMATION });
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.PATIENT_FETCH_SUCCEEDED, payload: action.payload });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.PATIENT_FETCH_FAILED, payload: e });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* watchPatientFetch() {
  yield takeLatest(actions.PATIENT_FETCH_REQUESTED, fetch);
}

function* watchPatientSearch() {
  yield takeLatest(actions.PATIENT_SEARCH_REQUESTED, search);
}

export default function* watchedPatientSagas() {
  yield all([
    watchPatientFetch(),
    watchPatientSearch(),
  ]);
}
