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
  patient: {
    query: null,
    results: [],
    total: 0,
  },
};

export const searchShape = {
  patient: PropTypes.shape({
    query: PropTypes.string,
    results: PropTypes.array,
    total: PropTypes.number,
  }),
};

const searchReducer = (state = initialSearchState, action) => produce(state, (draft) => {
  switch (action.type) {
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

    default:
      break;
  }
});

export default searchReducer;
