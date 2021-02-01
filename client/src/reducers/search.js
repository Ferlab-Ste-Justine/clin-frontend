/* eslint-disable no-param-reassign, no-underscore-dangle */
import { message, Modal } from 'antd';
import intl from 'react-intl-universal';
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { getNanuqModalConfigs } from '../components/NanuqModal';
import * as actions from '../actions/type';

import {
  LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_KEY,
  LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_ORDER_KEY,
  PATIENT_SEARCH_STORAGE_KEY,
  defaultUserSearchColumns,
  defaultUserSearchColumnsOrder,
} from '../helpers/search_table_helper.ts';

import { ClinStorage } from '../helpers/clin_storage';

export const initialSearchState = {
  lastSearchType: null,
  autocomplete: {
    query: null,
    page: 1,
    pageSize: 25,
    results: [],
    total: 0,
  },
  patient: {
    query: null,
    page: 1,
    pageSize: 25,
    results: [],
    total: 0,
  },
  columns: [],
  columnsOrder: [],
};

// @TODO
export const searchShape = {
  lastSearchType: PropTypes.string,
  autocomplete: PropTypes.shape({
    query: PropTypes.string,
    page: PropTypes.number,
    pageSize: PropTypes.number,
    results: PropTypes.array,
    total: PropTypes.number,
  }),
  patient: PropTypes.shape({
    query: PropTypes.string,
    page: PropTypes.number,
    pageSize: PropTypes.number,
    results: PropTypes.array,
    total: PropTypes.number,
  }),
  columns: PropTypes.array,
  columnsOrder: PropTypes.array,
};

const retrieveColumns = () => ClinStorage.getArray(LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_KEY, defaultUserSearchColumns,
  [
    (columns) => columns.some((str) => !str.startsWith(PATIENT_SEARCH_STORAGE_KEY)),
  ]);

const retrieveColumnsOrder = () => {
  const columnsOrder = window.localStorage.getItem(LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_ORDER_KEY);
  if (columnsOrder != null) {
    return JSON.parse(columnsOrder);
  }
  return defaultUserSearchColumnsOrder;
};

const searchReducer = (state = ({ ...initialSearchState }), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.USER_LOGOUT_SUCCEEDED:
      draft = { ...initialSearchState };
      break;

    case actions.PATIENT_SEARCH_SUCCEEDED:
      draft.patient.total = action.payload.data.data.total;
      draft.patient.results = action.payload.data.data.hits.map((hit) => hit._source);
      break;

    case actions.PATIENT_SEARCH_REQUESTED:
      draft.columns = [...retrieveColumns(), 'screen.patientsearch.table.select'];
      draft.columnsOrder = retrieveColumnsOrder();
      draft.lastSearchType = 'patient';
      draft.patient.page = action.payload.page || initialSearchState.patient.page;
      draft.patient.pageSize = action.payload.size || initialSearchState.patient.pageSize;
      draft.patient.query = action.payload.query || null;
      break;

    case actions.PATIENT_AUTOCOMPLETE_REQUESTED:
      draft.lastSearchType = action.payload.type === 'partial' ? 'autocomplete' : 'patient';
      draft.autocomplete.page = action.payload.page || initialSearchState.autocomplete.page;
      draft.autocomplete.pageSize = action.payload.size || initialSearchState.autocomplete.pageSize;
      draft.autocomplete.query = action.payload.query || null;
      break;

    case actions.PATIENT_AUTOCOMPLETE_SELECTED:
      draft.lastSearchType = 'patient';
      draft.patient.page = action.payload.page || initialSearchState.patient.page;
      draft.patient.pageSize = action.payload.size || initialSearchState.patient.pageSize;
      draft.patient.query = action.payload.query || null;
      break;

    case actions.PATIENT_AUTOCOMPLETE_FAILED:
      draft.autocomplete.total = initialSearchState.autocomplete.total;
      draft.autocomplete.results = initialSearchState.autocomplete.results;
      break;

    case actions.PATIENT_SEARCH_FAILED:
      draft.patient.total = initialSearchState.patient.total;
      draft.patient.results = initialSearchState.patient.results;
      break;

    case actions.PATIENT_AUTOCOMPLETE_SUCCEEDED:
      draft.autocomplete.total = action.payload.data.data.total;
      draft.autocomplete.results = action.payload.data.data.hits.map((hit) => hit._source);
      break;

    case actions.USER_PROFILE_UPDATE_COLUMNS:
      window.localStorage.setItem(LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_KEY, action.payload.columns.join(','));
      draft.columns = action.payload.columns;
      break;

    case actions.USER_PROFILE_UPDATE_COLUMNS_ORDER:
      window.localStorage.setItem(LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_ORDER_KEY, JSON.stringify(action.payload.columnsOrder));
      draft.columnsOrder = action.payload.columnsOrder;
      break;

    case actions.USER_PROFILE_UPDATE_COLUMNS_RESET:
      window.localStorage.removeItem(LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_KEY);
      window.localStorage.removeItem(LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_ORDER_KEY);
      draft.columns = retrieveColumns();
      draft.columnsOrder = retrieveColumnsOrder();
      break;

    case actions.NANUQ_EXPORT_SUCCEEDED:
      message.success(intl.get('screen.patientsearch.nanuqexport.success'));
      break;

    case actions.NANUQ_EXPORT_INVALID:
      Modal.error(getNanuqModalConfigs());
      break;

    case actions.NANUQ_EXPORT_FAILED:
      message.error(intl.get('screen.patientsearch.nanuqexport.error'));
      break;
    default:
      break;
  }
});

export default searchReducer;
