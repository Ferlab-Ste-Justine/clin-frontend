/* eslint-disable */

import uuidv1 from 'uuid/v1';
import {
  all, put, takeLatest, select, race, call, delay,
} from 'redux-saga/effects';
import { find, cloneDeep } from 'lodash';


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

function* countVariantsForPatient(action) {
  try {
    const {
      patient, statement, queries,
    } = action.payload;
    const variantResponse = yield Api.countVariantsForPatient(patient, statement, queries);
    if (variantResponse.error) {
      throw new ApiError(variantResponse.error);
    }
    yield put({ type: actions.PATIENT_VARIANT_COUNT_SUCCEEDED, payload: variantResponse.payload.data });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_COUNT_FAILED, payload: e });
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

function* watchVariantsCount() {
  yield takeLatest(actions.PATIENT_VARIANT_COUNT_REQUESTED, countVariantsForPatient);
}

function* watchUndo() {
  yield takeLatest(actions.PATIENT_VARIANT_UNDO, undo);
}

function* watchGetStatements() {
  yield takeLatest(actions.PATIENT_VARIANT_GET_STATEMENTS_REQUESTED, getStatements);
}

function* watchUpdateStatement() {
  yield takeLatest(actions.PATIENT_VARIANT_UPDATE_STATEMENT_REQUESTED, updateStatement);
}

function* watchCreateStatement() {
  yield takeLatest(actions.PATIENT_VARIANT_CREATE_STATEMENT_REQUESTED, createStatement);
}

function* watchDuplicateStatement() {
  yield takeLatest(actions.PATIENT_VARIANT_DUPLICATE_STATEMENT_REQUESTED, duplicateStatement);
}

function* watchDeleteStatement() {
  yield takeLatest(actions.PATIENT_VARIANT_DELETE_STATEMENT_REQUESTED, deleteStatement);
}

function* watchSelectStatement() {
  yield takeLatest(actions.PATIENT_VARIANT_SELECT_STATEMENT_REQUESTED, selectStatement);
}

function* getStatements() {
  try {
    const statementResponse = yield Api.getStatements();
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }

    yield put({ type: actions.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED, payload: statementResponse.payload.data });

    const { details } = yield select(state => state.patient);
    const { statements, activeStatementId, activeQuery } = yield select(state => state.variant);

    yield put({
      type: actions.PATIENT_VARIANT_COUNT_REQUESTED,
      payload: {
        patient: details.id,
        statement: statements[activeStatementId].queries,
        queries: statements[activeStatementId].queries.map(query => query.key),
      },
    });
    yield put({
      type: actions.PATIENT_VARIANT_SEARCH_REQUESTED,
      payload: {
        patient: details.id,
        statement: statements[activeStatementId].queries,
        query: activeQuery,
      },
    });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_GET_STATEMENTS_FAILED, payload: e });
  }
}

function* updateStatement(action) {
  try {
    const statementKey = action.payload.id;
    const { draftQueries, statements, activeStatementId } = yield select(state => state.variant);

    const title = action.payload.title ? action.payload.title : statements[activeStatementId].title;
    const description = action.payload.description ? action.payload.description : statements[activeStatementId].description;
    const isDefault = action.payload.switchCurrentStatementToDefault ? true : statements[activeStatementId].isDefault;
    const statementResponse = yield Api.updateStatement(statementKey, (title ? title : ''), (description ? description : ''), draftQueries, isDefault);
    if (statementResponse.error) {
      yield put({ type: actions.SHOW_NOTIFICATION, payload: { type: 'error', message: 'Filter not saved.' } });
      throw new ApiError(statementResponse.error);
    }

    yield put({ type: actions.PATIENT_VARIANT_UPDATE_STATEMENT_SUCCEEDED, payload: statementResponse.payload.data });
    yield put({ type: actions.SHOW_NOTIFICATION, payload: { type: 'success', message: 'Filter saved.' } });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_UPDATE_STATEMENT_FAILED, payload: e });
  }
}

function* createStatement(action) {
  try {
    const { draftQueries } = yield select(state => state.variant);

    const title = action.payload.title ? action.payload.title : '';
    const description = action.payload.description ? action.payload.description : '';
    const statementResponse = yield Api.createStatement(title, description, draftQueries);

    console.log('+ createStatement statementResponse ' + JSON.stringify(statementResponse))


    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }

    yield put({ type: actions.PATIENT_VARIANT_CREATE_STATEMENT_SUCCEEDED, payload: statementResponse.payload.data });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_CREATE_STATEMENT_FAILED, payload: e });
  }
}

function* duplicateStatement(action) {
  try {
    const { draftQueries, statements } = yield select(state => state.variant);
    const statement = cloneDeep(statements[statementKey]);
    if (!statement) {
      throw new Error('Statement not found');
    }

    statement.title = statementToDuplicate.title;
    statement.queries = draftQueries;
    yield put({ type: actions.PATIENT_VARIANT_DUPLICATE_STATEMENT_SUCCEEDED, payload: { statement } });

    const { details } = yield select(state => state.patient);
    const { activeQuery } = yield select(state => state.variant);

    yield put({
      type: actions.PATIENT_VARIANT_COUNT_REQUESTED,
      payload: {
        patient: details.id,
        statement,
        queries: statement.queries.map(query => query.key),
      },
    });
    yield put({
      type: actions.PATIENT_VARIANT_SEARCH_REQUESTED,
      payload: {
        patient: details.id,
        statement,
        query: activeQuery,
      },
    });

    yield put({ type: actions.SHOW_NOTIFICATION, payload: { type: 'success', message: 'Filter duplicated.' } });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_DUPLICATE_STATEMENT_FAILED, payload: e });
  }
}

function* deleteStatement(action) {
  try {
    const statementResponse = yield Api.deleteStatement(action.payload.id);
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }
    yield put({ type: actions.PATIENT_VARIANT_DELETE_STATEMENT_SUCCEEDED, payload: { uid: action.payload.id } });
    yield put({ type: actions.SHOW_NOTIFICATION, payload: { type: 'success', message: 'Filter removed.' } });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_DELETE_STATEMENT_FAILED, payload: e });
    yield put({ type: actions.SHOW_NOTIFICATION, payload: { type: 'error', message: 'Filter not removed.' } });
  }
}

function* selectStatement(action) {
  try {
    const statementKey = action.payload.id;
    yield put({ type: actions.PATIENT_VARIANT_SELECT_STATEMENT_SUCCEEDED, payload: { uid: statementKey } });

    const { details } = yield select(state => state.patient);
    const { statements, activeStatementId, activeQuery } = yield select(state => state.variant);

    yield put({
      type: actions.PATIENT_VARIANT_COUNT_REQUESTED,
      payload: {
        patient: details.id,
        statement: statements[activeStatementId],
        queries: statements[activeStatementId].queries.map(query => query.key),
      },
    });
    yield put({
      type: actions.PATIENT_VARIANT_SEARCH_REQUESTED,
      payload: {
        patient: details.id,
        statement: statements[activeStatementId].queries,
        query: activeQuery,
      },
    });
  } catch (e) {
    yield put({ type: actions.PATIENT_VARIANT_SELECT_STATEMENT_FAILED, payload: e });
  }
}

export default function* watchedVariantSagas() {
  yield all([
    watchVariantSchemaFetch(),
    watchGetStatements(),
    watchVariantsCount(),
    watchVariantSearch(),
    watchSelectStatement(),
    watchCreateStatement(),
    watchUpdateStatement(),
    watchDeleteStatement(),
    watchDuplicateStatement(),
    // watchUndo(), @NOTE Currently disabled
  ]);
}
