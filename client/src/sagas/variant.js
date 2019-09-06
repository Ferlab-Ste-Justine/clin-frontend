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

function* selectQueryInStatement(action) {
  try {
    const { patient, query } = action.payload;
    yield put({ type: actions.START_LOADING_ANIMATION });
    yield put({ type: actions.PATIENT_VARIANT_QUERY_REQUESTED });
    const variantResponse = yield Api.getPatientVariantsForQuery(patient, query);
    if (variantResponse.error) {
      throw new ApiError(variantResponse.error);
    }

    yield put({ type: actions.PATIENT_VARIANT_QUERY_SUCCEEDED, payload: variantResponse.payload.data });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_QUERY_FAILED, payload: e });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* watchVariantSchemaFetch() {
  yield takeLatest(actions.VARIANT_SCHEMA_REQUESTED, fetchSchema);
}

function* watchVariantQuerySelection() {
  yield takeLatest(actions.PATIENT_VARIANT_QUERY_SELECTION, selectQueryInStatement);
}

export default function* watchedVariantSagas() {
  yield all([
    watchVariantSchemaFetch(),
    watchVariantQuerySelection(),
  ]);
}
