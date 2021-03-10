import { message } from 'antd';
import intl from 'react-intl-universal';
import { all, put, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions/type';
import { updatePatient } from '../helpers/fhir/api/UpdatePatient';

function* handleEditPatient(action: any) {
  const hideLoadingMessage = message.loading(intl.get('screen.patient.details.edit.processing'));
  try {
    const updateResponse = yield updatePatient(action.payload.patient);
    yield put({ type: actions.PATIENT_EDITION_SUCCEEDED, payload: updateResponse.data });
  } catch (e) {
    console.error(e);
    yield put({ type: actions.PATIENT_EDITION_FAILED });
  }

  hideLoadingMessage();
}

function* watchEditPatient() {
  yield takeLatest(actions.PATIENT_EDITION_REQUESTED, handleEditPatient);
}

export default function* watchedPatientEditionSagas() {
  yield all([watchEditPatient()]);
}
