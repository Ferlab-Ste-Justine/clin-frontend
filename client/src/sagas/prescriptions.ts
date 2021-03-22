import {
  all, put, takeLatest, select,
} from 'redux-saga/effects';
import * as actions from '../actions/type';
import { createRequest, CreateRequestBatch } from '../helpers/fhir/api/CreateRequest';

function* handleCreateRequest(action: any) {
  try {
    const patient = yield select((state) => state.patient.patient.original);
    const batch = action.payload.batch as CreateRequestBatch;
    const response = yield createRequest(batch);

    yield put({ type: actions.CREATE_PATIENT_REQUEST_SUCCEEDED, payload: { ...response } });

    yield put({
      type: actions.NAVIGATION_PATIENT_SCREEN_REQUESTED,
      payload: { uid: patient.id, reload: true, openedPrescriptionId: action.payload.openedPrescriptionId },
    });
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
