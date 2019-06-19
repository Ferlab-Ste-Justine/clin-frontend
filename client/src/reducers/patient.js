/* eslint-disable no-param-reassign, import/no-cycle */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';
import {
  normalizePatientConsultations,
  normalizePatientDetails,
  normalizePatientFamily, normalizePatientIndications, normalizePatientObservations, normalizePatientOntology,
  normalizePatientOrganization,
  normalizePatientPractitioner, normalizePatientRequests, normalizePatientSamples,
  normalizePatientStudy,
} from '../helpers/struct';


export const initialPatientState = {
  details: {
    id: null,
    birthDate: null,
    gender: null,
    mrn: null,
    ramq: null,
    ethnicity: null,
    proband: null,
    firstName: null,
    lastName: null,
  },
  family: {
    id: null,
    composition: null,
    members: {
      proband: null,
      mother: null,
      father: null,
    },
    history: [],
  },
  practitioner: {},
  organization: {},
  study: {},
  consultations: [],
  requests: [],
  samples: [],
  observations: [],
  ontology: [],
  indications: [],
};

export const patientShape = {
  details: PropTypes.shape({}),
  family: PropTypes.shape({}),
  organization: PropTypes.shape({}),
  practitioner: PropTypes.shape({}),
  study: PropTypes.shape({}),
  consultations: PropTypes.array,
  requests: PropTypes.array,
  samples: PropTypes.array,
  observations: PropTypes.array,
  ontology: PropTypes.array,
  indications: PropTypes.array,
};

const patientReducer = (state = initialPatientState, action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.PATIENT_FETCH_SUCCEEDED:
      draft.details = normalizePatientDetails(action.payload.data);
      draft.family = normalizePatientFamily(action.payload.data);
      draft.organization = normalizePatientOrganization(action.payload.data);
      draft.practitioner = normalizePatientPractitioner(action.payload.data);
      draft.study = normalizePatientStudy(action.payload.data);
      draft.consultations = normalizePatientConsultations(action.payload.data);
      draft.requests = normalizePatientRequests(action.payload.data);
      draft.samples = normalizePatientSamples(action.payload.data);
      draft.observations = normalizePatientObservations(action.payload.data);
      draft.ontology = normalizePatientOntology(action.payload.data);
      draft.indications = normalizePatientIndications(action.payload.data);
      break;

    default:
      break;
  }
});

export default patientReducer;
