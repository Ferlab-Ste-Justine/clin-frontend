/* eslint-disable */

/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import _ from 'lodash';

import * as actions from '../actions/type';

export const initialPatientState = {
  details: {
    id: null,
    birthDate: null,
    gender: null,
    mrn: null,
    ramq: null,
    familyId: null,
    familyComposition: null,
    ethnicity: null,
    proband: null,
    practitioner: null,
    organization: null,
  },
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

      const patient = action.payload.patientResponse.data
      const familyIdExtension = _.find(patient.extension[0].extension, { url: 'familyId' });
      const familyCompositionExtension = _.find(patient.extension[0].extension, { url: 'familyComposition' });
      const probandExtension = _.find(patient.extension[0].extension, { url: 'isProband' });
      const ethnicityExtension = _.find(patient.extension[0].extension, { url: 'ethnicity' });

      // @TODO
      const identifierMRN = _.find(patient.identifier.type, { text: 'Numéro du dossier médical' } );
      const identifierRAMQ = _.find(patient.identifier.type, { text: 'Numéro assurance maladie du Québec' } );

      draft.details.id = patient.id;
      draft.details.birthDate = patient.birthDate;
      draft.details.gender = patient.gender;
      draft.details.organization = patient.managingOrganization.id;
      draft.details.familyId = familyIdExtension.valueId || null;
      draft.details.familyComposition = familyCompositionExtension.valueCode || null
      draft.details.ethnicity = ethnicityExtension.valueCode || null
      draft.details.proband = probandExtension.valueBoolean || null
      draft.details.mrn = identifierMRN.value;
      draft.details.ramq = identifierRAMQ.value;

      const resources = action.payload.resourcesResponse.data;

      // GET /Practitioner/PR00123
      // GET /Organization/OR00212

      // console.log('------- ++++++++ -------')
      // console.log(patient)
      // console.log(resources)

      draft.details = {};
      break;

    default:
      break;
  }
});

export default patientReducer;
