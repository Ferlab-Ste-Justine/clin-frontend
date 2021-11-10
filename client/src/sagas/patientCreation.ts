import get from 'lodash/get';
import {
  all, put, select, takeLatest,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';
import { createPatient, createPatientFetus } from '../helpers/fhir/api/CreatePatient';
import { isValidRamq } from '../helpers/fhir/api/PatientChecker';
import { addPatientMrn, updatePatientPractitioners } from '../helpers/fhir/api/UpdatePatient';

function* handleCreatePatient(action: any) {
  try {
    const response = yield createPatient(action.payload.patient);

    yield put({ payload: { ...response }, type: actions.CREATE_PATIENT_SUCCEEDED });
  } catch (error) {
    yield put({ type: actions.CREATE_PATIENT_FAILED });
  }
}

function* handleCreatePatientFetus(action: any) {
  try {
    const response = yield createPatientFetus(action.payload.patient, action.payload.fetusGender);

    yield put({ payload: { ...response }, type: actions.CREATE_PATIENT_FETUS_SUCCEEDED });
  } catch (error) {
    yield put({ type: actions.CREATE_PATIENT_FETUS_FAILED });
  }
}

function* handleUpdatePatientPractitioners(action: any) {
  try {
    const patient = yield select((state) => state.patient.patient.original);

    const response = yield updatePatientPractitioners(
      patient, action.payload.serviceRequest, action.payload.clinicalImpression,
    );

    yield put({ payload: { ...response }, type: actions.UPDATE_PATIENT_PRACTITIONMERS_SUCCEEDED });
  } catch (error) {
    yield put({ type: actions.UPDATE_PATIENT_PRACTITIONMERS_FAILED });
  }
}

function* fetchInfosByRamq(action: any) {
  try {
    if (!isValidRamq(action.payload.ramq)) {
      throw new Error('Invalid RAMQ');
    }

    const response = yield Api.getPatientByIdentifier(action.payload.ramq);

    if (response.error != null) {
      throw new ApiError(response.error);
    }

    const identifiers = get(response, 'payload.data.entry[0].resource.identifier', []);
    const identifier = identifiers.find((id: any) => get(id, 'type.coding[0].code', '') === 'JHN');

    if (identifier == null || identifier.value !== action.payload.ramq) {
      throw new ApiError(`Patient with RAMQ[${action.payload.ramq} not found.`);
    }

    yield put({
      payload: response.payload,
      type: actions.PATIENT_FETCH_INFO_BY_RAMQ_SUCCEEDED,
    });
  } catch (error) {
    yield put({ type: actions.PATIENT_FETCH_INFO_BY_RAMQ_FAILED });
  }
}

function* addMrn(action: any) {
  try {
    const patient = yield select((state) => state.patient.patient.original);

    const updatedPatient = yield addPatientMrn(patient, action.payload.mrn, action.payload.organization);

    yield put({ payload: { patient: updatedPatient }, type: actions.PATIENT_ADD_MRN_SUCCEEDED });
  } catch (error) {
    yield put({ type: actions.PATIENT_ADD_MRN_FAILED });
  }
}

function* watchCreatePatient() {
  yield takeLatest(actions.CREATE_PATIENT_REQUESTED, handleCreatePatient);
}

function* watchCreatePatientFetus() {
  yield takeLatest(actions.CREATE_PATIENT_FETUS_REQUESTED, handleCreatePatientFetus);
}
function* watchUpdatePatientPractitioners() {
  yield takeLatest(actions.UPDATE_PATIENT_PRACTITIONMERS_REQUESTED, handleUpdatePatientPractitioners);
}

function* watchFetchInfosByRamq() {
  yield takeLatest(actions.PATIENT_FETCH_INFO_BY_RAMQ, fetchInfosByRamq);
}

function* watchAddPatientMrn() {
  yield takeLatest(actions.PATIENT_ADD_MRN_REQUESTED, addMrn);
}

export default function* watchedPatientSubmissionSagas() {
  yield all([
    watchCreatePatient(),
    watchCreatePatientFetus(),
    watchUpdatePatientPractitioners(),
    watchFetchInfosByRamq(),
    watchAddPatientMrn(),
  ]);
}
