import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import { get } from 'lodash';
import * as actions from '../actions/type';
import { createPatient } from '../helpers/fhir/api/CreatePatient';
import { createRequest } from '../helpers/fhir/api/CreateRequest';
import Api, { ApiError } from '../helpers/api';

function* handleCreatePatient(action: any) {
  try {
    const response = yield createPatient(action.payload.patient, action.payload.group);

    yield put({ type: actions.CREATE_PATIENT_SUCCEEDED, payload: { ...response } });
  } catch (error) {
    yield put({ type: actions.CREATE_PATIENT_REQUEST_FAILED });
  }
}

function* handleCreateRequest(action: any) {
  try {
    const response = yield createRequest(action.payload.clinicalImpression, action.payload.serviceRequest, action.payload.observations);

    yield put({ type: actions.CREATE_PATIENT_SUCCEEDED, payload: { ...response } });
  } catch (error) {
    yield put({ type: actions.CREATE_PATIENT_REQUEST_FAILED });
  }
}

function* fetchInfosByRamq(action: any) {
  try {
    const response = yield Api.getPatientByRamq(action.payload.ramq);

    if (response.error != null) {
      throw new ApiError(response.error);
    }

    const identifiers = get(response, 'payload.data.entry[0].resource.identifier', []);
    const identifier = identifiers.find((id: any) => get(id, 'type.coding[0].code', '') === 'JHN');

    if (identifier == null || identifier.value !== action.payload.ramq) {
      throw new ApiError(`Patient with RAMQ[${action.payload.ramq} not found.`);
    }

    yield put({
      type: actions.PATIENT_FETCH_INFO_BY_RAMQ_SUCCEEDED,
      payload: response.payload,
    });
  } catch (error) {
    console.log(error);
    yield put({ type: actions.PATIENT_FETCH_INFO_BY_RAMQ_FAILED });
  }
}

function* watchCreatePatient() {
  yield takeLatest(actions.CREATE_PATIENT_REQUESTED, handleCreatePatient);
}

function* watchCreateRequest() {
  yield takeLatest(actions.CREATE_PATIENT_REQUEST_REQUESTED, handleCreateRequest);
}

function* watchFetchInfosByRamq() {
  yield takeLatest(actions.PATIENT_FETCH_INFO_BY_RAMQ, fetchInfosByRamq);
}

export default function* watchedPatientSubmissionSagas() {
  yield all([
    watchCreatePatient(),
    watchCreateRequest(),
    watchFetchInfosByRamq(),
  ]);
}
