/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';
// import _ from 'lodash';

import * as actions from '../actions/type';

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
  study: '',
  consultations: [],
  requests: [],
  samples: [],
  observations: [],
  onthology: [],
  indications: [],
};

export const patientShape = {
  details: PropTypes.shape({}),
  family: PropTypes.shape({}),
  organization: PropTypes.shape({}),
  practitioner: PropTypes.shape({}),
  study: PropTypes.string,
  consultations: PropTypes.array,
  requests: PropTypes.array,
  samples: PropTypes.array,
  observations: PropTypes.array,
  onthology: PropTypes.array,
  indications: PropTypes.array,
};

const patientReducer = (state = initialPatientState, action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.PATIENT_FETCH_SUCCEEDED:
      draft.details.id = action.payload.data.id;
      draft.details.firstName = '*** John ***';
      draft.details.lastName = '*** Doe ***';
      draft.details.birthDate = action.payload.data.birthDate;
      draft.details.gender = action.payload.data.gender;
      draft.details.ethnicity = action.payload.data.ethnicity;
      draft.details.proband = action.payload.data.isProband;
      draft.details.mrn = action.payload.data.identifier.MR;
      draft.details.ramq = action.payload.data.identifier.JHN;
      draft.family.id = action.payload.data.familyId;
      draft.family.composition = action.payload.data.familyComposition;
      draft.family.members.proband = action.payload.data.id;
      draft.family.members.mother = '*** ??? ***';
      draft.family.members.father = '*** ??? ***';
      draft.family.history = action.payload.data.familyMemberHistory.reduce((result, current) => {
        result.push({
          id: current.id,
          date: current.date,
          note: current.note[0].text,
        });
        return result;
      }, initialPatientState.family.history);

      if (action.payload.data.studies[0]) {
        draft.study = action.payload.data.studies[0].id;
      }

      if (action.payload.data.practitioners[0]) {
        draft.practitioner = {
          uid: action.payload.data.practitioners[0].id,
          rid: action.payload.data.practitioners[0].role_id,
          mln: action.payload.data.practitioners[0].identifier.MD,
          name: [
            action.payload.data.practitioners[0].name[0].prefix[0],
            action.payload.data.practitioners[0].name[0].given[0],
            action.payload.data.practitioners[0].name[0].family,
          ].join(' '),
        };
      }
      draft.organization = {
        uid: action.payload.data.organization.id,
        name: action.payload.data.organization.name,
      };

      draft.consultations = action.payload.data.clinicalImpressions.reduce((result, current) => {
        result.push({
          uid: current.id,
          age: current.runtimePatientAge,
          date: current.effective.dateTime,
          practitioner: '*** Dr Potato ***',
        });
        return result;
      }, initialPatientState.consultations);

      draft.requests = action.payload.data.serviceRequests.reduce((result, current) => {
        result.push({
          uid: current.id,
          date: current.authoredOn,
          type: current.code.text,
          author: '*** Mme Patate ***',
          specimen: '*** SP000002 ***',
          consulation: '*** CI930983 ***',
          status: current.status,
        });
        return result;
      }, initialPatientState.requests);

      draft.observations = action.payload.data.observations.reduce((result, current) => {
        if (!current.phenotype) {
          result.push({
            uid: current.id,
            date: current.effective.dateTime,
            note: current.note[0].text,
          });
        }
        return result;
      }, initialPatientState.observations);

      draft.onthology = action.payload.data.observations.reduce((result, current) => {
        if (current.phenotype) {
          result.push({
            ontologie: '*** HPO ***',
            code: current.phenotype[0].code,
            term: current.phenotype[0].display,
            note: '*** ??? ***',
            observed: '*** Oui ***',
            date: current.effective.dateTime,
            apparition: '*** 31-03-2019 ***',
          });
        }
        return result;
      }, initialPatientState.onthology);

      draft.samples = action.payload.data.specimens.reduce((result, current) => {
        result.push({
          uid: current.id,
          barcode: '*** 38939eiku77 ***',
          type: current.container[0],
          request: current.request[0],
        });
        return result;
      }, initialPatientState.samples);

      draft.indications = [{
        note: '*** Suspicion d\'une mutation a transmission récessive qui atteint le tissus musculaire ***',
        date: '*** 2019-12-01 ***',
      }];
      break;

    default:
      break;
  }
});

export default patientReducer;
