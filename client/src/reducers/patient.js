/* eslint-disable import/no-cycle, no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';
import {
  normalizePatientConsultations,
  normalizePatientDetails,
  normalizePatientFamily, normalizePatientImpressions,
  normalizePatientOrganization,
  normalizePatientPractitioner, normalizePatientRequests, normalizePatientSamples,
  normalizePatientStudy,
} from '../helpers/struct';


export const initialPatientState = {
  details: {
    id: null,
    birthDate: '',
    gender: null,
    mrn: null,
    ramq: null,
    ethnicity: null,
    proband: null,
    firstName: '',
    lastName: '',
  },
  family: {
    id: null,
    composition: null,
    members: {
      proband: null,
      mother: null,
      father: null,
    },
  },
  practitioner: {},
  organization: {},
  study: {},
  familyHistory: [],
  consultations: [],
  requests: [],
  samples: [],
  observations: [],
  ontology: [],
  indications: [],
};

// @TODO
export const patientShape = {
  details: PropTypes.shape({}),
  family: PropTypes.shape({}),
  organization: PropTypes.shape({}),
  practitioner: PropTypes.shape({}),
  study: PropTypes.shape({}),
  familyHistory: PropTypes.array,
  consultations: PropTypes.array,
  requests: PropTypes.array,
  samples: PropTypes.array,
  observations: PropTypes.array,
  ontology: PropTypes.array,
  indications: PropTypes.array,
};

const patientReducer = (state = Object.assign({}, initialPatientState), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.USER_LOGOUT_SUCCEEDED:
      draft = Object.assign({}, initialPatientState);
      break;

    case actions.PATIENT_FETCH_SUCCEEDED:
      draft.details = normalizePatientDetails(action.payload.data);
      draft.family = normalizePatientFamily(action.payload.data);
      draft.organization = normalizePatientOrganization(action.payload.data);
      draft.practitioner = normalizePatientPractitioner(action.payload.data);
      draft.study = normalizePatientStudy(action.payload.data);
      draft.consultations = normalizePatientConsultations(action.payload.data);
      draft.requests = normalizePatientRequests(action.payload.data);
      draft.samples = normalizePatientSamples(action.payload.data);
      const impressions = normalizePatientImpressions(action.payload.data); // eslint-disable-line no-case-declarations
      draft.observations = impressions.observations;
      draft.ontology = impressions.ontology;
      draft.indications = impressions.indications;
      draft.familyHistory = impressions.history;
      break;

    default:
      break;
  }
});

export default patientReducer;
