import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';
import {
  LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_KEY,
  LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_ORDER_KEY,
  defaultColumns,
  defaultColumnsOrder,
} from '../helpers/search_table_helper';


export const initialUserState = {
  username: null,
  firstName: null,
  lastName: null,
  profile: {
    uid: null,
    defaultStatement: null,
    patientTableConfig: {},
    variantTableConfig: {},
  },
  columns: null,
  columnsOrder: null,
};

export const userShape = {
  username: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  profile: PropTypes.shape({
    uid: PropTypes.string,
    defaultStatement: PropTypes.string,
    patientTableConfig: PropTypes.shape({}),
    variantTableConfig: PropTypes.shape({}),
  }),
  columns: PropTypes.array,
};

const retrieveColumns = () => {
  const columnsItem = window.localStorage.getItem(LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_KEY);
  if (columnsItem != null) {
    const columns = columnsItem.split(',');
    // Correct the item's content if invalid
    if (columns.length > 0 && columns.filter(str => !str.startsWith('screen.patientsearch.table.')).length > 0) {
      window.localStorage.setItem(LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_KEY, defaultColumns.join(','));
      return defaultColumns;
    }
    return columns;
  }
  return defaultColumns;
};

const retrieveColumnsOrder = () => {
  const columnsOrder = window.localStorage.getItem(LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_ORDER_KEY);
  try {
    return JSON.parse(columnsOrder);
  } catch (e) {
    return defaultColumnsOrder;
  }
};

const userReducer = (state = Object.assign({}, initialUserState), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.USER_LOGOUT_SUCCEEDED:
    case actions.USER_IDENTITY_FAILED:
      draft.username = null;
      break;

    case actions.USER_PROFILE_REQUESTED:
      draft.columns = retrieveColumns();
      draft.columnsOrder = retrieveColumnsOrder();
      break;
    case actions.USER_IDENTITY_SUCCEEDED:
      draft.username = action.payload.username;
      draft.firstName = action.payload.firstName;
      draft.lastName = action.payload.lastName;
      break;

    case actions.USER_PROFILE_SUCCEEDED:
      draft.profile.uid = action.payload.data.hits[0]._id;
      draft.profile.defaultStatement = action.payload.data.hits[0]._source.defaultStatement;
      draft.profile.patientTableConfig = JSON.parse(action.payload.data.hits[0]._source.patientTableConfig);
      draft.profile.variantTableConfig = JSON.parse(action.payload.data.hits[0]._source.variantTableConfig);
      break;

    case actions.USER_PROFILE_UPDATE_SUCCEEDED:
      draft.profile.defaultStatement = action.payload.data.defaultStatement;
      draft.profile.patientTableConfig = JSON.parse(action.payload.data.patientTableConfig);
      draft.profile.variantTableConfig = JSON.parse(action.payload.data.variantTableConfig);
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
    default:
      break;
  }
});

export default userReducer;
