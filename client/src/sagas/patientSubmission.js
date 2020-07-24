import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import { curry, omit } from 'lodash';

import * as actionTypes from '../actions/type';
import Api, { ApiError } from '../helpers/api';

const extractResponses = e => e.response;
const getLocation = response => response.location;
const getFieldName = (response) => {
  const type = getLocation(response).split('/')[0];
  switch (type) {
    case 'Patient':
      return 'patient';
    case 'ServiceRequest':
      return 'serviceRequest';
    default:
      return null;
  }
};
const getId = response => getLocation(response).split('/')[1];
// const getVersion = response => getLocation(response).split('/')[3];
const isPatient = response => getFieldName(response) === 'patient';
const isServiceRequest = r => r.resourceType === 'serviceRequest';
const getStatusCode = r => r.status.split(' ')[0];
const isCreate = r => getStatusCode(r) === '201';
const isUpdate = r => getStatusCode(r) === '200';

const processBundleResponse = curry((result, r) => {
  const entity = omit(r, 'resourceType');
  if (isUpdate(r)) {
    if (isPatient(r)) {
      result.patient = entity;
    }
    if (isServiceRequest(r)) {
      result.serviceRequest = entity;
    }
  }
  if (isCreate(r)) {
    if (isPatient(r)) {
      result.patient = { id: getId(r) };
    }
    if (isServiceRequest(r)) {
      result.serviceRequest = { id: getId(r) };
    }
  }
});

function* savePatient(action) {
  const { payload } = action;
  const { patient } = payload;

  yield put({
    type: actionTypes.PATIENT_SUBMISSION_SAVE_SUCCEEDED,
    payload: {
      patient,
    },
  });

  let response = null;
  try {
    response = patient.id ? yield Api.updatePatient(patient) : yield Api.savePatient(patient);
    if (response.error) {
      throw new ApiError(response.error);
    }

    const {
      entry,
    } = response.payload.data;

    const result = {};
    entry
      .map(extractResponses)
      .forEach(processBundleResponse(result));

    yield put({
      type: actionTypes.PATIENT_SUBMISSION_SAVE_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_SUBMISSION_SAVE_FAILED, payload: e });
  }
}

function* watchSavePatient() {
  yield takeLatest(actionTypes.PATIENT_SUBMISSION_SAVE_REQUESTED, savePatient);
}

export default function* watchedPatientSubmissionSagas() {
  yield all([
    watchSavePatient(),
  ]);
}
