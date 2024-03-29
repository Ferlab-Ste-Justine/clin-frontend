import * as actions from 'actions/type';
import { createRequest, CreateRequestBatch, updateRequest } from 'helpers/fhir/api/CreateRequest';
import {
  all, put, select, takeLatest, 
} from 'redux-saga/effects';
import Api from '../helpers/api';

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

function* downloadPrescriptionPDF(action: any) {
  try {
    const { id } = action.payload;
    const response = yield Api.downloadPrescriptionPDF(id);
    if (response.error) {
      return yield put({ payload: new ApiError(response.error), type: actions.DOWNLOAD_PRESCRIPTION_PDF_FAILED });
    }
    yield put({ payload: { id }, type: actions.DOWNLOAD_PRESCRIPTION_PDF_SUCCEEDED });
  } catch (e) {
    yield put({ payload: e, type: actions.DOWNLOAD_PRESCRIPTION_PDF_FAILED });
  }
}

function* watchDownloadPrescriptionPDF() {
  yield takeLatest(actions.DOWNLOAD_PRESCRIPTION_PDF_REQUEST, downloadPrescriptionPDF);
}

function* watchCreateRequest() {
  yield takeLatest(actions.CREATE_PATIENT_REQUEST_REQUESTED, handleCreateRequest);
}

export default function* watchedPatientSubmissionSagas() {
  yield all([
    watchCreateRequest(),
    watchDownloadPrescriptionPDF(),
  ]);
}
