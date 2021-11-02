import * as actions from 'actions/type';
import { createRequest, CreateRequestBatch, updateRequest } from 'helpers/fhir/api/CreateRequest';
import {
  all, put, select, takeLatest, 
} from 'redux-saga/effects';

function* handleCreateRequest(action: any) {
  try {
    const patient = yield select((state) => state.patientSubmission.patient);
    const batch = action.payload.batch as CreateRequestBatch;
    const handler = batch.update ? updateRequest : createRequest;
    const response = yield handler(batch);
    yield put({ payload: { ...response }, type: actions.CREATE_PATIENT_REQUEST_SUCCEEDED });
    yield put({
      payload: { openedPrescriptionId: response.serviceRequests[0].id, reload: true, uid: patient.id },
      type: actions.NAVIGATION_PATIENT_SCREEN_REQUESTED,
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
