import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import * as actionTypes from '../actions/type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createPatient } from '../helpers/fhir/api/CreatePatient';
import { createRequest } from '../helpers/fhir/api/CreateRequest';

function* handleCreatePatient(action: any) {
  try {
    console.log(action);
    const response = yield createPatient(action.payload.patient, action.payload.group);

    yield put({ type: actionTypes.CREATE_PATIENT_SUCCEEDED, payload: { ...response } });
  } catch (error) {
    yield put({ type: actionTypes.CREATE_PATIENT_REQUEST_FAILED });
  }
}

function* handleCreateRequest(action: any) {
  try {
    const response = yield createRequest(action.payload.clinicalImpression, action.payload.serviceRequest, action.payload.observations);

    yield put({ type: actionTypes.CREATE_PATIENT_SUCCEEDED, payload: { ...response } });
  } catch (error) {
    yield put({ type: actionTypes.CREATE_PATIENT_REQUEST_FAILED });
  }
}

function* watchCreatePatient() {
  yield takeLatest(actionTypes.CREATE_PATIENT_REQUESTED, handleCreatePatient);
}

function* watchCreateRequest() {
  yield takeLatest(actionTypes.CREATE_PATIENT_REQUEST_REQUESTED, handleCreateRequest);
}

export default function* watchedPatientSubmissionSagas() {
  yield all([
    watchCreatePatient(),
    watchCreateRequest(),
  ]);
}
