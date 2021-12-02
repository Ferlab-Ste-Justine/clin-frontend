import {
  all, put, takeLatest, 
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';

function* getServiceRequestCode() {
  try {
    // Verifier state si il exisxte deja concept. Si oui rien si non faire en dessous
    /* import {select, ...} from 'redux-saga/effects'

function* deserialize( action ) {
    const state = yield select();
    ....
    yield put({ type: 'DESERIALIZE_COMPLETE' });
}*/
    const response = yield Api.fetchServiceRequestCode();
    if (response.error) {
      return yield put({ payload: new ApiError(response.error), type: actions.SERVICE_REQUEST_CODE_FAILED });
    }
    yield put({ payload: { codes: response.payload.data.concept }, type: actions.SERVICE_REQUEST_CODE_SUCCEEDED });
  } catch (e) {
    yield put({ payload: e, type: actions.SERVICE_REQUEST_CODE_FAILED });
  }
}

function* watchServiceRequestCode() {
  yield takeLatest(actions.SERVICE_REQUEST_CODE_REQUESTED, getServiceRequestCode);
}

export default function* watchedServiceRequestSagas() {
  yield all([
    watchServiceRequestCode(),
  ]);
}