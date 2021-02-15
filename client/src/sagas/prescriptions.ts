import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import { createRequest } from '../helpers/fhir/api/CreateRequest';

function* handleCreateRequest(action: any) {
  try {
    const response = yield createRequest(action.payload.batch);

    yield put({ type: actions.CREATE_PATIENT_REQUEST_SUCCEEDED, payload: { ...response } });
  } catch (error) {
    yield put({ type: actions.CREATE_PATIENT_REQUEST_FAILED });
  }
}

function* watchCreateRequest() {
  yield takeLatest(actions.CREATE_PATIENT_REQUEST_REQUESTED, handleCreateRequest);
}
export default function* watchedPatientSubmissionSagas() {
  yield all([
    watchCreateRequest(),
  ]);
}
