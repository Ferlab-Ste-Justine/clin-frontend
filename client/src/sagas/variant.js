import {
  all, put, takeLatest, select,
} from 'redux-saga/effects';
import { find } from 'lodash';

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

function* searchVariantsForPatient(action) {
  try {
    const {
      patient, statement, query, group, index, limit,
    } = action.payload;
    yield put({ type: actions.START_LOADING_ANIMATION });
    const variantResponse = yield Api.searchVariantsForPatient(patient, statement, query, group, index, limit);
    if (variantResponse.error) {
      throw new ApiError(variantResponse.error);
    }

    yield put({ type: actions.PATIENT_VARIANT_SEARCH_SUCCEEDED, payload: variantResponse.payload.data });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_SEARCH_FAILED, payload: e });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* getUpdatedData() {
  const { activeQuery, draftQueries } = yield select(state => state.variant);
  const query = find(draftQueries, { key: activeQuery });
  const type = 'PATIENT_VARIANT_SEARCH_REQUESTED';

  if (!query) {
    const payload = {
      patient: 'PA00002',
      statement: [{ key: 'aggs', instructions: [] }],
      query: 'aggs',
      group: 'impact',
      index: 0,
      limit: 1,
    };
    yield put({ type, payload });
  } else {
    const payload = {
      patient: 'PA00002',
      statement: draftQueries,
      query: query.key,
      group: 'impact',
      index: 0,
      limit: 25,
    };
    yield put({ type, payload });
  }
}

function* createNewQuery() {
  yield put({ type: actions.PATIENT_VARIANT_QUERY_NEW });
}

function* watchForPatientFetchSucceed() {
  yield takeLatest(actions.PATIENT_FETCH_SUCCEEDED, createNewQuery);
}

function* watchVariantSchemaFetch() {
  yield takeLatest(actions.VARIANT_SCHEMA_REQUESTED, fetchSchema);
}

function* watchForUpdatedQueries() {
  yield takeLatest([
    actions.PATIENT_VARIANT_QUERY_NEW,
    actions.PATIENT_VARIANT_QUERY_REPLACEMENT,
    actions.PATIENT_VARIANT_QUERIES_REPLACEMENT,
    actions.PATIENT_VARIANT_QUERY_REMOVAL,
    actions.PATIENT_VARIANT_QUERY_DUPLICATION,
    actions.PATIENT_VARIANT_QUERY_ADD_INSTRUCTION,
    actions.PATIENT_VARIANT_UNDO,
  ], getUpdatedData);
}

function* watchVariantSearch() {
  yield takeLatest(actions.PATIENT_VARIANT_SEARCH_REQUESTED, searchVariantsForPatient);
}

export default function* watchedVariantSagas() {
  yield all([
    watchVariantSchemaFetch(),
    watchForPatientFetchSucceed(),
    watchVariantSearch(),
    watchForUpdatedQueries(),
  ]);
}
