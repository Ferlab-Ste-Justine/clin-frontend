/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';

export const initialPatientState = {
  details: {},
  clinicalImpressions: {},
  serviceRequests: {},
  specimens: {},
  observations: {
    medical: {},
    phenotype: {},
  },
  familyHistory: {},
};

export const patientShape = {
  details: PropTypes.shape({}),
  clinicalImpressions: PropTypes.shape({}),
  serviceRequests: PropTypes.shape({}),
  specimens: PropTypes.shape({}),
  observations: PropTypes.shape({
    medical: PropTypes.shape({}),
    phenotype: PropTypes.shape({}),
  }),
  familyHistory: PropTypes.shape({}),
};

const patientReducer = (state = initialPatientState, action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.PATIENT_FETCH_SUCCEEDED:
      console.log(action.payload);

      /*
      const patientPayload = {
      patientResponse,
      clinicalImpressionsResponse,
      familyHistoryResponse,
      medicalObservationsResponse,
      phenotypeObservationsResponse,
      serviceRequestsResponse,
      specimensResponse
      }
      */

      draft.details = {};
      break;

    default:
      break;
  }
});

export default patientReducer;
