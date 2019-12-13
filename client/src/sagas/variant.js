/* eslint-disable */

import {
  all, put, takeLatest, select,
} from 'redux-saga/effects';
import { find } from 'lodash';


import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';


function* fetchSchema() {
  try {
    const schemaResponse = yield Api.getVariantSchema();
    if (schemaResponse.error) {
      throw new ApiError(schemaResponse.error);
    }

    yield put({ type: actions.VARIANT_SCHEMA_SUCCEEDED, payload: schemaResponse.payload.data });
  } catch (e) {
    yield put({ type: actions.VARIANT_SCHEMA_FAILED, payload: e });
  }
}

function* searchVariantsForPatient(action) {
  try {
    const {
      patient, statement, query, group, index, limit,
    } = action.payload;
    const variantResponse = yield Api.searchVariantsForPatient(patient, statement, query, group, index, limit);
    if (variantResponse.error) {
      throw new ApiError(variantResponse.error);
    }

    yield put({ type: actions.PATIENT_VARIANT_SEARCH_SUCCEEDED, payload: variantResponse.payload.data });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_SEARCH_FAILED, payload: e });
  }
}

function* undo() {
  const { activeQuery, draftQueries } = yield select(state => state.variant);
  const { details } = yield select(state => state.patient);
  const query = find(draftQueries, { key: activeQuery });

  if (query) {
    const payload = {
      patient: details.id,
      statement: draftQueries,
      query: query.key,
      group: 'impact',
      index: 0,
      limit: 25,
    };
    yield put({ type: actions.PATIENT_VARIANT_SEARCH_REQUESTED, payload });
  }
}

function* watchVariantSchemaFetch() {
  yield takeLatest(actions.VARIANT_SCHEMA_REQUESTED, fetchSchema);
}

function* watchVariantSearch() {
  yield takeLatest(actions.PATIENT_VARIANT_SEARCH_REQUESTED, searchVariantsForPatient);
}

function* watchUndo() {
  yield takeLatest(actions.PATIENT_VARIANT_UNDO, undo);
}

function* watchGetStatements() {
  yield takeLatest(actions.PATIENT_VARIANT_GET_STATEMENTS_REQUESTED, getStatements);
}

function* watchCreateStatement() {
  yield takeLatest(actions.PATIENT_VARIANT_CREATE_STATEMENTS_REQUESTED, createStatement);
}

function* watchUpdateStatement() {
  yield takeLatest(actions.PATIENT_VARIANT_UPDATE_STATEMENT_REQUESTED, updateStatement);
}

function* watchDeleteStatement() {
  yield takeLatest(actions.PATIENT_VARIANT_DELETE_STATEMENT_REQUESTED, deleteStatement);
}

function* getStatements() {
  try {
    console.log('+ Variant Saga getStatements Called :D')
    const statementResponse = yield Api.getStatements();
    console.log(`+ getStatements call return ${JSON.stringify(statementResponse)}`)
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }
    yield put({ type: actions.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED, payload: {} });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_GET_STATEMENTS_FAILED, payload: e });
  }



  /*
  try {
    const statementResponse = yield Api.getStatements();
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }

    yield put({ type: actions.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED, payload: statementResponse.payload.data });


    yield put PATIENT_VARIANT_QUERY_SELECTION -> only sets in ui
    yield put PATIENT_VARIANT_SEARCH_REQUESTED -> actually does the api call



  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_GET_STATEMENTS_FAILED, payload: e });
  }
  */
}

function* createStatement() {
    console.log('+ Variant Saga createStatements Called :D')
}

function* updateStatement() {
  console.log('+ Variant Saga updateStatements Called :D')
}

function* deleteStatement() {
  console.log('+ Variant Saga deleteStatements Called :D')
}
export default function* watchedVariantSagas() {
  yield all([
    watchVariantSchemaFetch(),
    watchVariantSearch(),
    watchUndo(),
    watchGetStatements(),
    watchCreateStatement(),
    watchUpdateStatement(),
    watchDeleteStatement()
  ]);
}
