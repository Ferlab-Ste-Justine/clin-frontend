/* eslint-disable no-param-reassign, no-underscore-dangle */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import get from 'lodash/get';
import range from 'lodash/range';
import isEmpty from 'lodash/isEmpty';
import { message, Modal } from 'antd';
import intl from 'react-intl-universal';
import { genPractitionerKey } from '../helpers/fhir/fhir';
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
    clinicalImpression: {},
    cgh: {},
    summary: {},
    indic: {},
    eth: {},
    cons: {},
    consents: [],
    practitioner: '',
    requesterId: null,
    status: null,
  },
  deleted: {
    fmh: [],
    hpos: [],
  },
};

export const patientSubmissionShape = {
  data: PropTypes.shape({}),
};

const NOT_AVAILABLE = 'N/A';
const FAMILY_ID_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id';

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
      Modal.error({
        title: intl.get('screen.clinicalSubmission.notification.save.error.title'),
        content: intl.get('screen.clinicalSubmission.notification.save.error'),
      });
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
        status: 'draft',
      };
      break;
    case actions.PATIENT_SUBMISSION_FROM_PATIENT:
      draft.patient = action.payload.patient.patient.original;
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
        status: 'draft',
      };
      break;
    case actions.PATIENT_SUBMISSION_UPDATE_DATA: {
      const patientState = action.payload.patient;
      const index = patientState.prescriptions.findIndex((prescription) => prescription.original.id === action.payload.id);
      const patient = patientState.patient.original;
      draft.patient = patient;
      draft.status = 'draft';

      if (patientState.prescriptions != null && patientState.prescriptions.length > 0) {
        const serviceRequest = patientState.prescriptions[index].original;
        const clinicalImpression = patientState.consultation[index].original;

        const {
          cgh, precision, summary, hypothesis,
        } = patientState.consultation[index].parsed;

        const { requester } = patientState.prescriptions[index].parsed;

        const investigationItems = get(clinicalImpression, 'investigation[0].item', []);
        const hpos = patientState.hpos.map((hpo) => hpo.original).filter(
          (hpo) => investigationItems.find((item) => item.reference.indexOf(hpo.id) !== -1) != null,
        );
        const fmhs = patientState.fmhs.map((fmh) => fmh.parsed).filter(
          (fmh) => investigationItems.find((item) => item.reference.indexOf(fmh.id) !== -1) != null,
        );
        const { observations } = action.payload.patient;

        const familyGroupExt = getExtension(patient, FAMILY_ID_EXT_URL);
        const groupId = get(familyGroupExt, 'valueReference.reference', null);

        if (groupId != null) {
          const [, id] = groupId.split('/');
          draft.groupId = id;
        }

        draft.serviceRequest = {
          ...draft.serviceRequest,
          id: serviceRequest.id,
          code: get(serviceRequest, 'code.coding[0].code', null),
          identifier: serviceRequest.identifier || [],
        };
        draft.clinicalImpression = { ...draft.clinicalImpression, id: clinicalImpression.id };

        const clinicalCgh = observations.cgh.find(
          (obs) => investigationItems.find((item) => item.reference.indexOf(obs.id) !== -1) != null,
        );
        const clinicalIndic = observations.indic.find(
          (obs) => investigationItems.find((item) => item.reference.indexOf(obs.id) !== -1) != null,
        );
        const clinicalInves = observations.inves.find(
          (obs) => investigationItems.find((item) => item.reference.indexOf(obs.id) !== -1) != null,
        );
        const clinicalEth = observations.eth.find(
          (obs) => investigationItems.find((item) => item.reference.indexOf(obs.id) !== -1) != null,
        );
        const clinicalCons = observations.cons.find(
          (obs) => investigationItems.find((item) => item.reference.indexOf(obs.id) !== -1) != null,
        );

        draft.observations.hpos = hpos;
        draft.observations.fmh = fmhs;
        draft.observations.cgh = { ...clinicalCgh };
        draft.observations.indic = { ...clinicalIndic };
        draft.observations.summary = { ...clinicalInves };

        draft.local = {
          serviceRequest: {
            code: get(serviceRequest, 'code.coding[0].code'),
            id: serviceRequest.id,
            authoredOn: get(serviceRequest, 'authoredOn'),
          },
          clinicalImpression: {
            id: clinicalImpression.id,
          },
          cgh: {
            id: get(clinicalCgh, 'id'),
            interpretation: cgh,
            precision,
          },
          indic: {
            id: get(clinicalIndic, 'id'),
            note: hypothesis !== NOT_AVAILABLE ? hypothesis : '',
          },
          summary: {
            id: get(clinicalInves, 'id'),
            note: summary !== NOT_AVAILABLE ? summary : '',
          },
          eth: {
            id: get(clinicalEth, 'id'),
            code: get(clinicalEth, 'valueCodeableConcept.coding[0].code'),
            note: get(clinicalEth, 'note[0].text'),
          },
          cons: {
            id: get(clinicalCons, 'id'),
            value: get(clinicalCons, 'valueBoolean'),
          },
          consents: range(1, 5).map((value) => `consent-${value}`),
          practitioner: '',
          status: serviceRequest.status,
        };

        const requesterReference = get(patientState, `prescriptions[${index}].original.requester.reference`);
        if (requesterReference != null) {
          const [, requesterId] = requesterReference.split('/');
          draft.local.requesterId = requesterId;
          draft.local.practitioner = genPractitionerKey({
            family: requester.lastName,
            given: requester.firstName,
            license: requester.mrn,
          });
        }
      } else {
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
      }
      break;
    }
    case actions.PATIENT_ADD_MRN_SUCCEEDED: {
      draft.patient.identifier = action.payload.patient.identifier;
      break;
    }
    default:
      break;
  }
});

export default patientSubmissionReducer;
