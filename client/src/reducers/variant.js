/* eslint-disable no-param-reassign, no-underscore-dangle */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import {
  cloneDeep, findIndex, isEqual, last, head,
} from 'lodash';
import intl from 'react-intl-universal';
import uuidv1 from 'uuid/v1';

import * as actions from '../actions/type';
import { normalizePatientDetails } from '../helpers/struct';
import { INSTRUCTION_TYPE_SUBQUERY } from '../components/Query/Subquery';
import { sanitizeInstructions } from '../components/Query/helpers/query';


const MAX_REVISIONS = 10;

export const initialVariantState = {
  schema: {},
  activePatient: null,
  activeQuery: null,
  originalQueries: [],
  draftQueries: [],
  draftHistory: [],
  results: {},
  facets: {},
  statements: {},
  activeStatementId: null,
  activeStatementTotals: {},
};

// @TODO
export const variantShape = {
  schema: PropTypes.shape({}),
  activePatient: PropTypes.String,
  activeQuery: PropTypes.String,
  originalQueries: PropTypes.array,
  draftQueries: PropTypes.array,
  draftHistory: PropTypes.array,
  results: PropTypes.shape({}),
  facets: PropTypes.shape({}),
  statements: PropTypes.shape({}),
  activeStatementId: PropTypes.String,
  activeStatementTotals: PropTypes.shape({}),
};

export const DRAFT_STATEMENT_UID = 'draft';
const createDraftStatement = (title, description = '', queries = null) => ({
  uid: DRAFT_STATEMENT_UID,
  title,
  description,
  queries: queries || [{ key: uuidv1(), instructions: [] }],
  isDefault: false,
});

const variantReducer = (state = Object.assign({}, initialVariantState), action) => produce(state, (draft) => {
  const { draftQueries, draftHistory } = draft;
  const { payload } = action;

  switch (action.type) {
    case actions.USER_LOGOUT_SUCCEEDED:
    case actions.USER_SESSION_HAS_EXPIRED:
      draft = Object.assign({}, initialVariantState);
      break;

    case actions.VARIANT_SCHEMA_SUCCEEDED:
      draft.schema = action.payload.data;
      break;

    case actions.PATIENT_FETCH_SUCCEEDED:
      const details = normalizePatientDetails(action.payload.data); // eslint-disable-line no-case-declarations
      draft.activePatient = details.id;
      draft.originalQueries = [{
        key: uuidv1(),
        instructions: [],
      }];
      draft.draftQueries = cloneDeep(draft.originalQueries);
      draft.activeQuery = draft.originalQueries[0].key;
      break;

    case actions.PATIENT_VARIANT_QUERY_SELECTION:
      if (action.payload.key) {
        draft.activeQuery = action.payload.key;
      }
      break;

    case actions.PATIENT_VARIANT_SEARCH_SUCCEEDED:
      draft.facets[action.payload.data.query] = action.payload.data.facets;
      draft.results[action.payload.data.query] = action.payload.data.hits;
      draft.activeStatementTotals[action.payload.data.query] = action.payload.data.total;
      break;

    case actions.PATIENT_VARIANT_SEARCH_FAILED:
      draft.facets[action.payload.data.query] = {};
      draft.results[action.payload.data.query] = {};
      break;

    case actions.PATIENT_VARIANT_COUNT_SUCCEEDED:
      Object.keys(action.payload.data.total).forEach((key) => {
        draft.activeStatementTotals[key] = action.payload.data.total[key];
      });
      break;

    case actions.PATIENT_VARIANT_QUERY_REMOVAL:
      if (draft.draftQueries.length > 1) {
        draft.draftQueries = draft.draftQueries.filter(query => action.payload.keys.indexOf(query.key) === -1);
        // @NOTE Remove matching subquery instructions
        const filteredDrafts = draft.draftQueries.map((draftQuery) => {
          const filteredInstructions = draftQuery.instructions.filter(instruction => !(instruction.type === INSTRUCTION_TYPE_SUBQUERY && action.payload.keys.indexOf(instruction.data.query) !== -1));
          draftQuery.instructions = sanitizeInstructions(filteredInstructions);
          return draftQuery;
        });
        draft.draftQueries = filteredDrafts;
        draft.activeQuery = last(draft.draftQueries).key;
      } else {
        const newStatement = createDraftStatement(intl.get('screen.patientvariant.modal.statement.save.input.title.default'));
        draft.statements[draft.activeStatementId].queries = newStatement.queries;
        draft.activeQuery = head(newStatement.queries).key;
        draft.draftQueries = newStatement.queries;
        draft.draftHistory = [];
      }
      break;

    case actions.PATIENT_VARIANT_QUERY_DUPLICATION:
      if (action.payload.query) {
        const keyToDuplicate = action.payload.query.key;
        const indexToInsertAt = action.payload.index || draft.draftQueries.length;
        const indexToDuplicate = findIndex(draft.draftQueries, { key: keyToDuplicate });
        if (indexToDuplicate) {
          draft.draftQueries.splice(indexToInsertAt, 0, action.payload.query);
          draft.activeQuery = action.payload.query.key;
        }
      }
      break;

    case actions.PATIENT_VARIANT_QUERY_REPLACEMENT:
      const { query } = action.payload; // eslint-disable-line no-case-declarations
      const index = findIndex(draftQueries, { key: query.key }); // eslint-disable-line no-case-declarations
      if (index > -1) {
        draftQueries[index] = query;
      } else {
        draftQueries.push(query);
      }
      draft.draftQueries = draftQueries;
      break;

    case actions.PATIENT_VARIANT_QUERIES_REPLACEMENT:
      draft.draftQueries = action.payload.queries;
      break;

    case actions.PATIENT_VARIANT_STATEMENT_SORT:
      draft.draftQueries = action.payload.statement;
      break;

    case actions.PATIENT_VARIANT_COMMIT_HISTORY:
      const newCommit = { // eslint-disable-line no-case-declarations
        activeQuery: draft.activeQuery,
        draftQueries: action.payload.version,
      };
      if (!isEqual(newCommit, last(draftHistory))) {
        draftHistory.push(newCommit);
      }
      if (draftHistory.length > MAX_REVISIONS) {
        draftHistory.shift();
      }
      break;

    case actions.PATIENT_VARIANT_UNDO:
      const lastVersion = draftHistory.pop(); // eslint-disable-line no-case-declarations
      draft.draftQueries = lastVersion.draftQueries;
      draft.activeQuery = lastVersion.activeQuery;
      break;

    case actions.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED:
      if (action.payload.data.total < 1) {
        draft.activeStatementId = DRAFT_STATEMENT_UID;
        draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(intl.get('screen.patientvariant.modal.statement.save.input.title.default'));
        draft.activeQuery = head(draft.statements[DRAFT_STATEMENT_UID].queries).key;
        draft.originalQueries = [];
        draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
        draft.draftHistory = [];
      } else {
        draft.statements = {};
        action.payload.data.hits.forEach((hit) => {
          draft.statements[hit._id] = {
            uid: hit._id,
            title: hit._source.title,
            description: hit._source.description,
            queries: JSON.parse(hit._source.queries),
            isDefault: hit._source.isDefault,
          };
        });
        if (!state.activeStatementId) {
          const defaultStatementId = Object.keys(draft.statements).find(
            statementKey => draft.statements[statementKey].isDefault === true,
          );
          if (defaultStatementId) {
            draft.activeStatementId = defaultStatementId;
            draft.activeQuery = last(draft.statements[defaultStatementId].queries).key || null;
            draft.originalQueries = draft.statements[defaultStatementId].queries;
            draft.draftQueries = draft.statements[defaultStatementId].queries;
            draft.draftHistory = [];
          } else {
            draft.activeStatementId = DRAFT_STATEMENT_UID;
            draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(intl.get('screen.patientvariant.modal.statement.save.input.title.default'));
            draft.activeQuery = head(draft.statements[DRAFT_STATEMENT_UID].queries).key;
            draft.originalQueries = [];
            draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
            draft.draftHistory = [];
          }
        }
      }
      break;

    case actions.PATIENT_VARIANT_SELECT_STATEMENT_SUCCEEDED:
      delete draft.statements.draft;
      const statementId = action.payload.uid ? action.payload.uid : Object.keys(draft.statements).find( // eslint-disable-line no-case-declarations
        statementKey => draft.statements[statementKey].isDefault === true,
      );
      draft.activeStatementId = statementId;
      draft.activeQuery = last(draft.statements[statementId].queries).key;
      draft.originalQueries = draft.statements[statementId].queries;
      draft.draftQueries = draft.statements[statementId].queries;
      draft.draftHistory = [];
      break;

    case actions.PATIENT_VARIANT_UPDATE_STATEMENT_SUCCEEDED:
      const updatedStatement = { // eslint-disable-line no-case-declarations
        uid: action.payload.data.uid,
        title: action.payload.data.title,
        description: action.payload.data.description,
        queries: JSON.parse(action.payload.data.queries),
        isDefault: action.payload.data.isDefault,
      };

      draft.statements[updatedStatement.uid] = updatedStatement;
      break;

    case actions.PATIENT_VARIANT_CREATE_STATEMENT_SUCCEEDED:
      delete draft.statements.draft;
      const createdStatement = { // eslint-disable-line no-case-declarations
        uid: action.payload.data.uid,
        title: action.payload.data.title,
        description: action.payload.data.description,
        queries: JSON.parse(action.payload.data.queries),
        isDefault: action.payload.data.isDefault,
      };
      draft.statements[createdStatement.uid] = createdStatement;
      draft.activeStatementId = createdStatement.uid;
      draft.originalQueries = cloneDeep(createdStatement.queries);
      draft.draftQueries = cloneDeep(createdStatement.queries);
      draft.draftHistory = [];
      break;

    case actions.PATIENT_VARIANT_DUPLICATE_STATEMENT_SUCCEEDED:
      draft.activeStatementId = DRAFT_STATEMENT_UID;
      draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(
        payload.statement.title,
        payload.statement.description,
        payload.statement.queries,
      );
      draft.activeQuery = draft.statements[DRAFT_STATEMENT_UID].queries[draft.statements[DRAFT_STATEMENT_UID].queries.length - 1].key;
      draft.originalQueries = [];
      draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
      draft.draftHistory = [];
      break;

    case actions.PATIENT_VARIANT_DELETE_STATEMENT_SUCCEEDED:
      delete draft.statements[action.payload.uid];
    case actions.PATIENT_VARIANT_CREATE_DRAFT_STATEMENT: // eslint-disable-line no-fallthrough
      draft.activeStatementId = DRAFT_STATEMENT_UID;
      if (payload.statement) {
        draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(
          payload.statement.title,
        );
      } else {
        draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(intl.get('screen.patientvariant.modal.statement.save.input.title.default'));
      }
      draft.activeQuery = head(draft.statements[DRAFT_STATEMENT_UID].queries).key;
      draft.originalQueries = [];
      draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
      draft.draftHistory = [];
      break;

    default:
      break;
  }
});

export default variantReducer;
