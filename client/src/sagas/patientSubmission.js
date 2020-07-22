import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import { curry } from 'lodash';

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
  if (isUpdate(r)) {
    console.log('TODO: process update bundle response');
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

  let savePatientResponse = null;
  try {
    savePatientResponse = yield Api.savePatient(patient);
    if (savePatientResponse.error) {
      throw new ApiError(savePatientResponse.error);
    }

    const {
      entry,
    } = savePatientResponse.payload.data;

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
    if (savePatientResponse.error.response && savePatientResponse.error.response.status === 404) {
      yield put({ type: actionTypes.NAVIGATION_ACCESS_DENIED_SCREEN_REQUESTED });
    }
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
