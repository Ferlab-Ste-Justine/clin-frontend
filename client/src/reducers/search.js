/* eslint-disable no-param-reassign, no-underscore-dangle */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import * as actions from '../actions/type';
import {
  normalizePatientDetails, normalizePatientFamily,
  normalizePatientOrganization,
  normalizePatientPractitioner, normalizePatientRequests,
  normalizePatientStudy,
} from '../helpers/struct';


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
};

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
};

const searchReducer = (state = Object.assign({}, initialSearchState), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.USER_LOGOUT_SUCCEEDED:
    case actions.USER_SESSION_HAS_EXPIRED:
      draft = Object.assign({}, initialSearchState);
      break;

    case actions.PATIENT_SEARCH_SUCCEEDED:
      draft.patient.total = action.payload.data.data.total;
      draft.patient.results = action.payload.data.data.hits.map((hit) => {
        const patient = {
          details: normalizePatientDetails(hit._source),
          family: normalizePatientFamily(hit._source),
          practitioner: normalizePatientPractitioner(hit._source),
          organization: normalizePatientOrganization(hit._source),
          study: normalizePatientStudy(hit._source),
          requests: normalizePatientRequests(hit._source),
        };
        return patient;
      });
      break;

    case actions.PATIENT_SEARCH_REQUESTED:
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
      draft.autocomplete.results = action.payload.data.data.hits.map((hit) => {
        const details = normalizePatientDetails(hit._source);
        return `${details.id} ${details.firstName} ${details.lastName}`;
      });
      break;

    default:
      break;
  }
});

export default searchReducer;
