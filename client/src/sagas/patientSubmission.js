import {
  all, put, select, takeLatest,
} from 'redux-saga/effects';

import * as actionTypes from '../actions/type';

function* editPrescription(action) {
  try {
    const patient = yield select((state) => state.patient);
    yield put({ type: actionTypes.PATIENT_SUBMISSION_UPDATE_DATA, payload: { patient, id: action.payload.id } });
    yield put({ type: actionTypes.NAVIGATION_EDIT_SUBMISSION_REQUESTED });
    yield put({ type: actionTypes.EDIT_PRESCRIPTION_SUCCEEDED });
  } catch (error) {
    yield put({ type: actionTypes.EDIT_PRESCRIPTION_FAILED, payload: error });
  }
}

function* watchEditPrescription() {
  yield takeLatest(actionTypes.EDIT_PRESCRIPTION_REQUESTED, editPrescription);
}

export default function* watchedPatientSubmissionSagas() {
  yield all([
    watchEditPrescription(),
  ]);
}
