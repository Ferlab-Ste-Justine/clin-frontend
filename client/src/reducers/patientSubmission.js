/* eslint-disable no-param-reassign, no-underscore-dangle */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';

import { getHPOCode, getFamilyRelationshipCode } from '../helpers/fhir/fhir';

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
  clinicalImpression: {
    investigation: [
      {
        item: [
          {
            resourceType: 'FamilyMemberHistory',
            relationship: {
              coding: [
                {
                  code: '',
                  display: '',
                }],
            },
            note: [
              {}],
          }],
      },
    ],
  },
  observations: {
    cgh: null,
    indic: null,
    familyHistory: null,
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
        indic: {
          ...draft.observations.indic, ...action.payload.result.indic,
        },
      };
      break;
    case actions.PATIENT_SUBMISSION_ASSIGN_PRACTITIONER:
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
    case actions.PATIENT_SUBMISSION_ADD_HPO_RESOURCE:
      draft.clinicalImpression = {
        ...draft.clinicalImpression,
        investigation:
          [
            {
              item: [...draft.clinicalImpression.investigation[0].item, action.payload],
            },
          ],
      };
      break;
    case actions.PATIENT_SUBMISSION_MARK_HPO_FOR_DELETION:
      draft.clinicalImpression = {
        ...draft.clinicalImpression,
        investigation:
          [
            {
              item: [...draft.clinicalImpression.investigation[0].item.map((resource) => {
                if (getHPOCode(resource) === action.payload.code) {
                  if (resource.id) {
                    return { ...resource, toDelete: action.payload.toDelete };
                  }
                  if (action.payload.toDelete) {
                    return null;
                  }
                }
                return resource;
              }).filter(r => r !== null),
              ],
            },
          ],
      };
      break;
    case actions.PATIENT_SUBMISSION_ADD_FAMILY_RELATIONSHIP_RESOURCE:
      draft.clinicalImpression = {
        ...draft.clinicalImpression,
        investigation:
          [
            {
              item: [...draft.clinicalImpression.investigation[0].item, action.payload],
            },
          ],
      };
      break;
    case actions.PATIENT_SUBMISSION_MARK_FAMILY_RELATIONSHIP_FOR_DELETION:
      draft.clinicalImpression = {
        ...draft.clinicalImpression,
        investigation:
          [
            {
              item: [...draft.clinicalImpression.investigation[0].item.map((resource) => {
                if (action.payload.id) {
                  if (action.payload.id === resource.id) {
                    return { ...resource, toDelete: action.payload.toDelete };
                  }
                }
                if (action.payload.code === getFamilyRelationshipCode(resource) && action.payload.toDelete) {
                  return null;
                }
                return resource;
              }).filter(r => r !== null),
              ],
            },
          ],
      };
      break;
    default:
      break;
  }
});

export default patientSubmissionReducer;
