import {
  all, put, takeLatest, select,
} from 'redux-saga/effects';
import { cloneDeep } from 'lodash';
import intl from 'react-intl-universal';

import * as actionTypes from '../actions/type';
import * as actions from '../actions/app';
import Api, { ApiError } from '../helpers/api';

function* fetchSchema() {
  try {
    const schemaResponse = yield Api.getVariantSchema();
    if (schemaResponse.error) {
      throw new ApiError(schemaResponse.error);
    }

    yield put({ type: actionTypes.VARIANT_SCHEMA_SUCCEEDED, payload: schemaResponse.payload.data });
  } catch (e) {
    yield put({ type: actionTypes.VARIANT_SCHEMA_FAILED, payload: e });
  }
}

function* searchVariantsForPatient(action) {
  try {
    const {
      patient, statement, query, index, limit,
    } = action.payload;
    const variantResponse = yield Api.searchVariantsForPatient(patient, statement, query, index, limit);

    if (variantResponse.error) {
      throw new ApiError(variantResponse.error);
    }
    yield put({ type: actionTypes.PATIENT_VARIANT_SEARCH_SUCCEEDED, payload: variantResponse.payload.data });
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_VARIANT_SEARCH_FAILED, payload: e });
  }
}

function* searchFacetsForPatient(action) {
  try {
    const {
      patient, statement, query,
    } = action.payload;
    const facetResponse = yield Api.searchFacetsForPatient(patient, statement, query);

    if (facetResponse.error) {
      throw new ApiError(facetResponse.error);
    }
    yield put({ type: actionTypes.PATIENT_VARIANT_FACET_SUCCEEDED, payload: facetResponse.payload.data });
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_VARIANT_FACET_FAILED, payload: e });
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
    yield put({ type: actionTypes.PATIENT_VARIANT_COUNT_SUCCEEDED, payload: variantResponse.payload.data });
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_VARIANT_COUNT_FAILED, payload: e });
  }
}

function* getStatements() {
  try {
    const statementResponse = yield Api.getStatements();
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }

    const { defaultStatement } = yield select(state => state.user.profile);
    const { activeStatement } = yield select(state => state.variant);
    if (!activeStatement || activeStatement === 'draft') {
      yield put({ type: actionTypes.PATIENT_VARIANT_SET_ACTIVE_STATEMENT, payload: defaultStatement });
    }
    yield put({ type: actionTypes.PATIENT_VARIANT_SET_DEFAULT_STATEMENT, payload: defaultStatement });
    yield put({ type: actionTypes.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED, payload: statementResponse.payload.data });
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_VARIANT_GET_STATEMENTS_FAILED, payload: e });
  }
}

function* updateStatement(action) {
  try {
    const statementKey = action.payload.id;
    const { statements } = yield select(state => state.variant);
    const title = action.payload.title ? action.payload.title : statements[statementKey].title;
    const description = action.payload.description ? action.payload.description : statements[statementKey].description;
    const queries = action.payload.queries ? action.payload.queries : statements[statementKey].queries;
    const statementResponse = yield Api.updateStatement(statementKey, title, description, queries);
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }

    yield put({ type: actionTypes.PATIENT_VARIANT_UPDATE_STATEMENT_SUCCEEDED, payload: statementResponse.payload.data });
    yield put(actions.success('screen.patientvariant.notification.save.success'));
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_VARIANT_UPDATE_STATEMENT_FAILED, payload: e });
    yield put(actions.error('screen.patientvariant.notification.save.error'));
  }
}

function* createStatement(action) {
  try {
    const { draftQueries } = yield select(state => state.variant);
    const title = action.payload.title ? action.payload.title : '';
    const description = action.payload.description ? action.payload.description : '';
    const statementResponse = yield Api.createStatement(title, description, draftQueries, false);
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }

    yield put({ type: actionTypes.PATIENT_VARIANT_CREATE_STATEMENT_SUCCEEDED, payload: statementResponse.payload.data });
    yield put(actions.success('screen.patientvariant.notification.create.success'));
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_VARIANT_CREATE_STATEMENT_FAILED, payload: e });
    yield put(actions.error('screen.patientvariant.notification.create.error'));
  }
}

function* duplicateStatement(action) {
  try {
    const { draftQueries, statements } = yield select(state => state.variant);
    const statement = cloneDeep(statements[action.payload.id]);
    if (!statement) {
      throw new Error('Filtre non-trouvé.');
    }

    statement.title = intl.get('screen.patientvariant.modal.statement.duplicate.input.title.format', { title: statement.title });
    statement.queries = draftQueries;
    yield put({ type: actionTypes.PATIENT_VARIANT_DUPLICATE_STATEMENT_SUCCEEDED, payload: { statement } });
    yield put(actions.success('screen.patientvariant.notification.duplicate.success'));
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_VARIANT_DUPLICATE_STATEMENT_FAILED, payload: e });
    yield put(actions.error('screen.patientvariant.notification.duplicate.error'));
  }
}

function* deleteStatement(action) {
  try {
    const statementResponse = yield Api.deleteStatement(action.payload.id);
    if (statementResponse.error) {
      throw new ApiError(statementResponse.error);
    }
    yield put({ type: actionTypes.PATIENT_VARIANT_DELETE_STATEMENT_SUCCEEDED, payload: { uid: action.payload.id } });
    yield put(actions.success('screen.patientvariant.notification.delete.success'));
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_VARIANT_DELETE_STATEMENT_FAILED, payload: e });
    yield put(actions.error('screen.patientvariant.notification.delete.success'));
  }
}

function* selectStatement(action) {
  try {
    const statementKey = action.payload.id;
    yield put({ type: actionTypes.PATIENT_VARIANT_SELECT_STATEMENT_SUCCEEDED, payload: { uid: statementKey } });
  } catch (e) {
    yield put({ type: actionTypes.PATIENT_VARIANT_SELECT_STATEMENT_FAILED, payload: e });
  }
}

function* refreshCount() {
  const { details } = yield select(state => state.patient);
  const { draftQueries } = yield select(state => state.variant);

  yield put({
    type: actionTypes.PATIENT_VARIANT_COUNT_REQUESTED,
    payload: {
      patient: details.id,
      statement: draftQueries,
      queries: draftQueries.map(query => query.key),
    },
  });
}

function* refreshResults() {
  const { details } = yield select(state => state.patient);
  const { draftQueries, activeQuery } = yield select(state => state.variant);

  yield put({
    type: actionTypes.PATIENT_VARIANT_SEARCH_REQUESTED,
    payload: {
      patient: details.id,
      statement: draftQueries,
      query: activeQuery,
    },
  });
}

function* refreshFacets() {
  const { details } = yield select(state => state.patient);
  const { draftQueries, activeQuery } = yield select(state => state.variant);

  yield put({
    type: actionTypes.PATIENT_VARIANT_FACET_REQUESTED,
    payload: {
      patient: details.id,
      statement: draftQueries,
      query: activeQuery,
    },
  });
}

function* watchVariantSchemaFetch() {
  yield takeLatest(actionTypes.VARIANT_SCHEMA_REQUESTED, fetchSchema);
}

function* watchVariantSearch() {
  yield takeLatest(actionTypes.PATIENT_VARIANT_SEARCH_REQUESTED, searchVariantsForPatient);
}

function* watchFacetSearch() {
  yield takeLatest(actionTypes.PATIENT_VARIANT_FACET_REQUESTED, searchFacetsForPatient);
}

function* watchVariantsCount() {
  yield takeLatest(actionTypes.PATIENT_VARIANT_COUNT_REQUESTED, countVariantsForPatient);
}

function* watchGetStatements() {
  yield takeLatest(actionTypes.PATIENT_VARIANT_GET_STATEMENTS_REQUESTED, getStatements);
}

function* watchUpdateStatement() {
  yield takeLatest(actionTypes.PATIENT_VARIANT_UPDATE_STATEMENT_REQUESTED, updateStatement);
}

function* watchCreateStatement() {
  yield takeLatest(actionTypes.PATIENT_VARIANT_CREATE_STATEMENT_REQUESTED, createStatement);
}

function* watchDuplicateStatement() {
  yield takeLatest(actionTypes.PATIENT_VARIANT_DUPLICATE_STATEMENT_REQUESTED, duplicateStatement);
}

function* watchDeleteStatement() {
  yield takeLatest(actionTypes.PATIENT_VARIANT_DELETE_STATEMENT_REQUESTED, deleteStatement);
}

function* watchSelectStatement() {
  yield takeLatest(actionTypes.PATIENT_VARIANT_SELECT_STATEMENT_REQUESTED, selectStatement);
}

function* watchRefreshCount() {
  yield takeLatest([
    actionTypes.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_SELECT_STATEMENT_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_DUPLICATE_STATEMENT_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_DELETE_STATEMENT_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_CREATE_DRAFT_STATEMENT,
    actionTypes.PATIENT_VARIANT_QUERY_REMOVAL,
    actionTypes.PATIENT_VARIANT_QUERY_REPLACEMENT,
    actionTypes.PATIENT_VARIANT_QUERIES_REPLACEMENT,
  ], refreshCount);
}

function* watchRefreshResults() {
  yield takeLatest([
    actionTypes.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_SELECT_STATEMENT_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_DUPLICATE_STATEMENT_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_DELETE_STATEMENT_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_CREATE_DRAFT_STATEMENT,
    actionTypes.PATIENT_VARIANT_QUERY_REMOVAL,
    actionTypes.PATIENT_VARIANT_QUERY_REPLACEMENT,
    actionTypes.PATIENT_VARIANT_QUERIES_REPLACEMENT,
    actionTypes.PATIENT_VARIANT_QUERY_SELECTION,
  ], refreshResults);
}

function* watchRefreshFacets() {
  yield takeLatest([
    actionTypes.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_SELECT_STATEMENT_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_DUPLICATE_STATEMENT_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_DELETE_STATEMENT_SUCCEEDED,
    actionTypes.PATIENT_VARIANT_CREATE_DRAFT_STATEMENT,
    actionTypes.PATIENT_VARIANT_QUERY_REMOVAL,
    actionTypes.PATIENT_VARIANT_QUERY_REPLACEMENT,
    actionTypes.PATIENT_VARIANT_QUERIES_REPLACEMENT,
    actionTypes.PATIENT_VARIANT_QUERY_SELECTION,
  ], refreshFacets);
}

export default function* watchedVariantSagas() {
  yield all([
    watchVariantSchemaFetch(),
    watchGetStatements(),
    watchVariantsCount(),
    watchVariantSearch(),
    watchFacetSearch(),
    watchSelectStatement(),
    watchCreateStatement(),
    watchUpdateStatement(),
    watchDeleteStatement(),
    watchDuplicateStatement(),
    watchRefreshCount(),
    watchRefreshResults(),
    watchRefreshFacets(),
  ]);
}
