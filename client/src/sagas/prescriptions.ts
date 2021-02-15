import {
  all, put, takeLatest,
} from 'redux-saga/effects';
import * as actions from '../actions/type';
import { createRequest, CreateRequestBatch } from '../helpers/fhir/api/CreateRequest';

function* handleCreateRequest(action: any) {
  try {
    const batch = action.payload.batch as CreateRequestBatch;
    const response = yield createRequest(batch);

    yield put({ type: actions.CREATE_PATIENT_REQUEST_SUCCEEDED, payload: { ...response } });
    if (batch.submitted) {
      yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED, payload: { reload: false } });
    }
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
