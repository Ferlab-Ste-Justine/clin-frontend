/* eslint-disable no-param-reassign, no-underscore-dangle */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import {
  isEmpty, get, range,
} from 'lodash';
import { message } from 'antd';
import intl from 'react-intl-universal';
import * as actions from '../actions/type';

const getExtension = (resource, url) => get(resource, 'extension', []).find((ext) => ext.url === url);

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
  groupId: null,
  observations: {
    cgh: null,
    indic: null,
    summary: null,
    fmh: [{}],
    hpos: [],
  },
  local: {
    serviceRequest: {},
    cgh: {},
    summary: {},
    indic: {},
    consents: [],
    practitioner: '',
  },
  deleted: {
    fmh: [],
    hpos: [],
  },
  editMode: false,
};

export const patientSubmissionShape = {
  data: PropTypes.shape({}),
};

const NOT_AVAILABLE = 'N/A';
const patientSubmissionReducer = (
  state = ({ ...initialPatientSubmissionState }),
  action,
) => produce(state, (draft) => {
  switch (action.type) {
    case actions.PATIENT_SUBMISSION_SAVE_SUCCEEDED:
      draft.patient = { ...action.payload.patient, ...action.payload.result.patient };
      if (action.payload.result.groupId != null) {
        draft.groupId = action.payload.result.groupId.id;
      }
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
        fmh: draft.observations.fmh.filter((fmh) => !isEmpty(fmh)).map((fmh, index) => ({
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
    case actions.PATIENT_SUBMISSION_LOCAL_CGH_SAVE_REQUESTED:
      draft.local.cgh.interpretation = action.payload.interpretation;
      draft.local.cgh.precision = action.payload.precision;
      break;
    case actions.PATIENT_SUBMISSION_LOCAL_SUMMARY_SAVE_REQUESTED:
      draft.local.summary.note = action.payload.summary;
      break;
    case actions.PATIENT_SUBMISSION_LOCAL_INDIC_SAVE_REQUESTED:
      draft.local.indic.note = action.payload.indic;
      break;
    case actions.PATIENT_SUBMISSION_LOCAL_CONSENTS_SAVE:
      draft.local.consents = action.payload.consents;
      break;
    case actions.PATIENT_SUBMISSION_LOCAL_PRACTITIONER:
      draft.local.practitioner = action.payload.practitioner;
      break;
    case actions.PATIENT_SUBMISSION_ADD_HPO_RESOURCE:
      draft.observations.hpos.push(action.payload);
      break;
    case actions.PATIENT_SUBMISSION_MARK_HPO_FOR_DELETION:
      if (draft.observations.hpos.find((hpo) => hpo.valueCodeableConcept.coding[0].code === action.payload.code) != null) {
        if (draft.observations.hpos.find((hpo) => hpo.valueCodeableConcept.coding[0].code === action.payload.code).id != null) {
          draft.deleted.hpos.push(draft.observations.hpos.find((hpo) => hpo.valueCodeableConcept.coding[0].code === action.payload.code));
        }
      }
      draft.observations.hpos = draft.observations.hpos.filter((hpo) => hpo.valueCodeableConcept.coding[0].code !== action.payload.code);
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
        .filter((ext) => ext.url !== 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset');
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
    case actions.PATIENT_SUBMISSION_UPDATE_FMH_NOTE:
      if (draft.observations.fmh[action.payload.index] != null
        && !isEmpty(draft.observations.fmh[action.payload.index])) {
        if (draft.observations.fmh[action.payload.index].note.length > 0) {
          draft.observations.fmh[action.payload.index].note[0].text = action.payload.note;
        } else {
          draft.observations.fmh[action.payload.index].note = [{
            text: action.payload.note,
          }];
        }
      }
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
      draft.local = {
        serviceRequest: {},
        cgh: {},
        summary: {},
        indic: {},
        consents: [],
        practitioner: '',
      };
      break;
    case actions.PATIENT_SUBMISSION_SET_EDIT_MODE:
      draft.editMode = action.payload.editMode;
      break;
    case actions.PATIENT_SUBMISSION_UPDATE_DATA: {
      const patient = action.payload.patient.patient.original;
      const serviceRequest = action.payload.patient.prescriptions[0].original;
      const clinicalImpression = action.payload.patient.consultation[0].original;

      const {
        cgh, summary, hypothesis,
      } = action.payload.patient.consultation[0].parsed;

      const { performer } = action.payload.patient.prescriptions[0].parsed;

      const { generalPractitioner } = patient;

      const hpos = action.payload.patient.hpos.map((hpo) => hpo.original);
      const fmhs = action.payload.patient.fmhs.map((fmh) => fmh.original);
      const { observations } = action.payload.patient;

      const groupId = getExtension(patient, 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id');

      draft.patient = action.payload.patient.patient.original;
      draft.groupId = groupId;
      draft.serviceRequest = {
        ...draft.serviceRequest,
        id: serviceRequest.id,
        code: get(serviceRequest, 'code.coding[0].code', null),
      };
      draft.clinicalImpression = { ...draft.clinicalImpression, id: clinicalImpression.id };

      draft.observations.hpos = hpos;
      draft.observations.fmh = fmhs;
      draft.observations.cgh = { ...observations.cgh };
      draft.observations.indic = { ...observations.indic };
      draft.observations.summary = { ...observations.inves };
      draft.observations.fmh.push({});

      draft.local = {
        serviceRequest: {
          code: get(serviceRequest, 'code.coding[0].code', null),
        },
        cgh: {
          interpretation: cgh,
        },
        summary: {
          note: summary !== NOT_AVAILABLE ? summary : '',
        },
        indic: {
          note: hypothesis !== NOT_AVAILABLE ? hypothesis : '',
        },
        consents: range(1, 5).map((value) => `consent-${value}`),
        practitioner: '',
      };

      if (get(generalPractitioner, 'length', 0) > 0) {
        draft.local.practitioner = performer.mrn;
      }
      break;
    }
    default:
      break;
  }
});

export default patientSubmissionReducer;
