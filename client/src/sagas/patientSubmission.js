import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import * as actionTypes from '../actions/type';
import Api, { ApiError } from '../helpers/api';

function* savePatient(action) {
  const { payload } = action;
  const { patient } = payload;
  let savePatientResponse = null;
  try {
    savePatientResponse = yield Api.savePatient(patient);
    if (savePatientResponse.error) {
      throw new ApiError(savePatientResponse.error);
    }

    yield put({ type: actionTypes.PATIENT_SUBMISSION_SAVE_SUCCEEDED, payload: savePatientResponse.payload.data.data });
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_SUBMISSION_SAVE_FAILED, payload: e });
    if (savePatientResponse.error.response && savePatientResponse.error.response.status === 404) {
      yield put({ type: actionTypes.NAVIGATION_ACCESS_DENIED_SCREEN_REQUESTED });
    } else {
      // yield put({ type: actionTypes.USER_SESSION_HAS_EXPIRED });
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
