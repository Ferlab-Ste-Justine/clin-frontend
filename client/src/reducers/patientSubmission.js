/* eslint-disable no-param-reassign, no-underscore-dangle */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import { isEmpty } from 'lodash';
import { message } from 'antd';
import intl from 'react-intl-universal';
import * as actions from '../actions/type';

// @TODO change item values
export const initialPatientSubmissionState = {
  patient: {
    name: [
      {
        family: '',
        given: [],
      },
    ],
    gender: '',
    birthDate: '',
  },
  familyGroup: null,
  practitionerId: null,
  serviceRequest: {},
  clinicalImpression: {},
  observations: {
    cgh: null,
    indic: null,
    summary: null,
    fmh: [{}],
    hpos: [],
  },
  local: {
    serviceRequest: {},
  },
  deleted: {
    fmh: [],
    hpos: [],
  },
};

export const patientSubmissionShape = {
  data: PropTypes.shape({}),
};

const patientSubmissionReducer = (
  state = Object.assign({}, initialPatientSubmissionState),
  action,
) => produce(state, (draft) => {
  switch (action.type) {
    case actions.PATIENT_SUBMISSION_SAVE_SUCCEEDED:
      draft.patient = { ...action.payload.patient, ...action.payload.result.patient };
      draft.serviceRequest = { ...draft.serviceRequest, ...action.payload.serviceRequest, ...action.payload.result.serviceRequest };
      draft.clinicalImpression = { ...draft.clinicalImpression, ...action.payload.clinicalImpression, ...action.payload.result.clinicalImpression };

      draft.observations = {
        ...draft.observations,
        cgh: {
          ...draft.observations.cgh, ...action.payload.result.cgh,
        },
        summary: {
          ...draft.observations.summary, ...action.payload.result.summary,
        },
        indic: {
          ...draft.observations.indic, ...action.payload.result.indic,
        },
        fmh: draft.observations.fmh.filter(fmh => !isEmpty(fmh)).map((fmh, index) => ({
          ...fmh,
          ...action.payload.result.fmh[index],
        })),
        hpos: draft.observations.hpos.map((hpo, index) => ({
          ...hpo,
          ...action.payload.result.hpos[index],
        })),
      };

      draft.observations.fmh.push({});
      draft.deleted.fmh = [];
      draft.deleted.hpos = [];

      message.success(intl.get('screen.clinicalSubmission.notification.save.success'));
      break;
    case actions.PATIENT_SUBMISSION_SAVE_FAILED:
      message.error(intl.get('screen.clinicalSubmission.notification.save.error'));
      break;
    case actions.PATIENT_SUBMISSION_ASSIGN_PRACTITIONER:
      draft.practitionerId = action.payload.id;
      draft.serviceRequest = {
        ...draft.serviceRequest,
        requester: action.payload,
      };
      break;
    case actions.PATIENT_SUBMISSION_LOCAL_SAVE_REQUESTED:
      draft.patient = {
        ...draft.patient,
        ...action.payload,
      };
      break;
    case actions.PATIENT_SUBMISSION_OBSERVATIONS_SAVE_REQUESTED:
      if (action.payload != null) {
        draft.observations.cgh = action.payload.cgh;
        draft.observations.indic = action.payload.indic;
      }
      break;
    case actions.PATIENT_SUBMISSION_SERVICE_REQUEST_SAVE_REQUESTED:
      if (action.payload != null) {
        draft.local.serviceRequest.code = action.payload.code;
      }
      break;
    case actions.PATIENT_SUBMISSION_ADD_HPO_RESOURCE:
      draft.observations.hpos.push(action.payload);
      break;
    case actions.PATIENT_SUBMISSION_MARK_HPO_FOR_DELETION:
      if (draft.observations.hpos.find(hpo => hpo.valueCodeableConcept.coding[0].code === action.payload.code) != null) {
        if (draft.observations.hpos.find(hpo => hpo.valueCodeableConcept.coding[0].code === action.payload.code).id != null) {
          draft.deleted.hpos.push(draft.observations.hpos.find(hpo => hpo.valueCodeableConcept.coding[0].code === action.payload.code));
        }
      }
      draft.observations.hpos = draft.observations.hpos.filter(hpo => hpo.valueCodeableConcept.coding[0].code !== action.payload.code);
      break;
    case actions.PATIENT_SUBMISSION_UPDATE_HPO_NOTE:
      draft.observations.hpos[action.payload.index].note = [{
        text: action.payload.note,
      }];
      break;
    case actions.PATIENT_SUBMISSION_UPDATE_HPO_OBSERVATION:
      draft.observations.hpos[action.payload.index].interpretation = [
        {
          coding: [
            action.payload.observation.interpretation,
          ],
        },
      ];
      break;
    case actions.PATIENT_SUBMISSION_UPDATE_HPO_AGE_ON_SET:
      draft.observations.hpos[action.payload.index].extension = draft.observations.hpos[action.payload.index].extension
        .filter(ext => ext.url !== 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset');
      draft.observations.hpos[action.payload.index].extension.push({
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset',
        valueCoding: {
          code: action.payload.age.code,
          display: action.payload.age.display,
        },
      });
      break;
    case actions.PATIENT_SUBMISSION_ADD_FAMILY_RELATIONSHIP_RESOURCE:
      draft.observations.fmh = action.payload;
      break;
    case actions.PATIENT_SUBMISSION_ADD_EMPTY_FAMILY_RELATIONSHIP:
      draft.observations.fmh.push({});
      break;
    case actions.PATIENT_SUBMISSION_MARK_FAMILY_RELATIONSHIP_FOR_DELETION:
      action.payload.deleted.forEach((deleted) => {
        draft.deleted.fmh.push(deleted);
      });
      break;
    case actions.NAVIGATION_SUBMISSION_SCREEN_REQUESTED:
      draft.patient = initialPatientSubmissionState.patient;
      draft.practitionerId = initialPatientSubmissionState.practitionerId;
      draft.clinicalImpression = initialPatientSubmissionState.clinicalImpression;
      draft.serviceRequest = initialPatientSubmissionState.serviceRequest;
      draft.observations = initialPatientSubmissionState.observations;
      draft.deleted = initialPatientSubmissionState.deleted;
      break;
    default:
      break;
  }
});

export default patientSubmissionReducer;
