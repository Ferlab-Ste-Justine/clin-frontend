import {
  all, put, select, takeLatest
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';

function* getServiceRequestCode() {
  const conceptsInStore = yield select((state) => state.serviceRequestCode.concept);
  if (conceptsInStore.length > 0) {
    return
  }
  try {
    const response = yield Api.fetchServiceRequestCode();
    if (response.error) {
      return yield put({ payload: new ApiError(response.error), type: actions.SERVICE_REQUEST_CODE_FAILED });
    }
    yield put({ payload: response.payload.data.concept, type: actions.SERVICE_REQUEST_CODE_SUCCEEDED });
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