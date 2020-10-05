import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import * as actionTypes from '../actions/type';
import Api, { ApiError } from '../helpers/api';

const extractResponses = e => e.response;
const getLocation = response => response.location;
const getFieldName = (response) => {
  const type = getLocation(response).split('/')[0];
  const fieldname = type[0].toLowerCase() + type.substring(1);
  return fieldname;
};
const getId = response => getLocation(response).split('/')[1];
// const getVersion = response => getLocation(response).split('/')[3];
const isPatient = r => getFieldName(r) === 'patient';
const isServiceRequest = r => getFieldName(r) === 'serviceRequest';
const isObservation = r => getFieldName(r) === 'observation';
const isFamilyRelationship = r => getFieldName(r) === 'familyMemberHistory';
const isInvestigation = r => isObservation(r) || isFamilyRelationship(r);
const isClinicalImpression = r => getFieldName(r) === 'clinicalImpression';

const getStatusCode = r => r.status.split(' ')[0];
const isCreate = r => getStatusCode(r) === '201';
const isDelete = r => getStatusCode(r) === '204';

const processBundleResponse = (r) => {
  if (r && isCreate(r)) {
    return { id: getId(r) };
  }

  if (r && isDelete(r)) {
    return { id: getId(r), toDelete: true };
  }

  return {};
};

function* savePatientSubmission(action) {
  const { payload } = action;

  let response = null;
  try {
    response = yield Api.savePatientSubmission(payload);
    if (response.error) {
      throw new ApiError(response.error);
    }

    const {
      entry,
    } = response.payload.data;

    const responses = entry.map(extractResponses);

    const result = {};
    result.patient = processBundleResponse(responses.find(isPatient));
    result.serviceRequest = processBundleResponse(responses.find(isServiceRequest));
    result.clinicalImpression = processBundleResponse(responses.find(isClinicalImpression));
    result.investigations = [
      ...responses.filter(isInvestigation).map(processBundleResponse),
    ];

    yield put({
      type: actionTypes.PATIENT_SUBMISSION_SAVE_SUCCEEDED,
      payload: {
        ...payload,
        result,
      },
    });
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_SUBMISSION_SAVE_FAILED, payload: e });
  }
}

function* watchSavePatientSubmission() {
  yield takeLatest(actionTypes.PATIENT_SUBMISSION_SAVE_REQUESTED, savePatientSubmission);
}

export default function* watchedPatientSubmissionSagas() {
  yield all([
    watchSavePatientSubmission(),
  ]);
}
