import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';


function* fetchSchema() {
  try {
    yield put({ type: actions.START_LOADING_ANIMATION });
    const schemaResponse = yield Api.getVariantSchema();
    if (schemaResponse.error) {
      throw new ApiError(schemaResponse.error);
    }

    yield put({ type: actions.VARIANT_SCHEMA_SUCCEEDED, payload: schemaResponse.payload.data });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.VARIANT_SCHEMA_FAILED, payload: e });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* watchVariantSchemaFetch() {
  yield takeLatest(actions.VARIANT_SCHEMA_REQUESTED, fetchSchema);
}

export default function* watchedPatientSagas() {
  yield all([
    watchVariantSchemaFetch(),
  ]);
}
