/* eslint-disable no-param-reassign, no-underscore-dangle */
import intl from 'react-intl-universal';
import { message, Modal } from 'antd';
import { produce } from 'immer';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import range from 'lodash/range';
import PropTypes from 'prop-types';

import * as actions from '../actions/type';
import { genPractitionerKey } from '../helpers/fhir/fhir';

const getExtension = (resource, url) => get(resource, 'extension', []).find((ext) => ext.url === url);

// @TODO change item values
export const initialPatientSubmissionState = {
  clinicalImpression: {},
  deleted: {
    fmh: [],
    hpos: [],
  },
  familyGroup: null,
  groupId: null,
  local: {
    cgh: {},
    clinicalImpression: {},
    cons: {},
    consents: [],
    eth: {},
    indic: {},
    practitioner: '',
    requesterId: null,
    resident: '',
    serviceRequest: {},
    status: null,
    summary: {},
    supervisor: {},
  },
  observations: {
    cgh: null,
    cons:{},
    fmh: [{}],
    hpos: [],
    indic: null,
    summary: null,
  },
  patient: {
    birthDate: '',
    gender: '',
    name: [
      {
        family: '',
        given: [],
      },
    ],
  },
  practitionerId: null,
  residentId: null,
  serviceRequest: {},
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
    draft.serviceRequest = {
      ...draft.serviceRequest,
      ...action.payload.serviceRequest,
      ...action.payload.result.serviceRequest,
    };
    draft.clinicalImpression = {
      ...draft.clinicalImpression,
      ...action.payload.clinicalImpression,
      ...action.payload.result.clinicalImpression,
    };

    draft.observations = {
      ...draft.observations,
      cgh: {
        ...draft.observations.cgh, ...action.payload.result.cgh,
      },
      fmh: draft.observations.fmh.filter((fmh) => !isEmpty(fmh)).map((fmh, index) => ({
        ...fmh,
        ...action.payload.result.fmh[index],
      })),
      hpos: draft.observations.hpos.map((hpo, index) => ({
        ...hpo,
        ...action.payload.result.hpos[index],
      })),
      indic: {
        ...draft.observations.indic, ...action.payload.result.indic,
      },
      summary: {
        ...draft.observations.summary, ...action.payload.result.summary,
      },
    };

    draft.observations.fmh.push({});
    draft.deleted.fmh = [];
    draft.deleted.hpos = [];

    message.success(intl.get('screen.clinicalSubmission.notification.save.success'));
    break;
  case actions.PATIENT_SUBMISSION_SAVE_FAILED:
    Modal.error({
      content: intl.get('screen.clinicalSubmission.notification.save.error'),
      title: intl.get('screen.clinicalSubmission.notification.save.error.title'),
    });
    break;
  case actions.PATIENT_SUBMISSION_ASSIGN_PRACTITIONER:
    draft.practitionerId = action.payload.id;
    draft.serviceRequest = {
      ...draft.serviceRequest,
      requester: action.payload,
    };
    break;
  case actions.PATIENT_SUBMISSION_ASSIGN_RESIDENT: {
    draft.residentId = action.payload != null ? action.payload.id : null;
    if (draft.serviceRequest.extension == null) {
      draft.serviceRequest.extension = [];
    }

    const extensions = [...draft.serviceRequest.extension];
    const residentExtensionIndex = extensions.findIndex((ext) => ext.url.includes('resident'));
    if (residentExtensionIndex !== -1) {
      extensions.splice(residentExtensionIndex, 1);
    }

    if (action.payload) {
      extensions.push({
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/resident',
        valueReference: {
          reference: `PractitionerRole/${action.payload.id}`,
        },
      });
    }

    draft.serviceRequest = {
      ...draft.serviceRequest,
      extension: extensions,
    };
    break;
  }
  case actions.PATIENT_SUBMISSION_LOCAL_PRACTITIONER:
    draft.local.practitioner = action.payload.practitioner;
    break;
  case actions.PATIENT_SUBMISSION_LOCAL_SUPERVISOR:
    draft.local.supervisor = action.payload.supervisor;
    break;
  case actions.PATIENT_SUBMISSION_LOCAL_RESIDENT:
    draft.local.resident = action.payload.resident;
    break;
  case actions.NAVIGATION_SUBMISSION_SCREEN_REQUESTED:
    draft.patient = initialPatientSubmissionState.patient;
    draft.practitionerId = initialPatientSubmissionState.practitionerId;
    draft.clinicalImpression = initialPatientSubmissionState.clinicalImpression;
    draft.serviceRequest = initialPatientSubmissionState.serviceRequest;
    draft.observations = initialPatientSubmissionState.observations;
    draft.deleted = initialPatientSubmissionState.deleted;
    draft.local = {
      cgh: {},
      consents: [],
      indic: {},
      practitioner: '',
      serviceRequest: {},
      status: 'draft',
      summary: {},
    };
    break;
  case actions.PATIENT_SUBMISSION_FROM_PATIENT:
    draft.patient = action.payload.patient.patient.original;
    draft.clinicalImpression = initialPatientSubmissionState.clinicalImpression;
    draft.serviceRequest = initialPatientSubmissionState.serviceRequest;
    draft.observations = initialPatientSubmissionState.observations;
    draft.deleted = initialPatientSubmissionState.deleted;
    draft.local = {
      cgh: {},
      consents: [],
      indic: {},
      practitioner: '',
      serviceRequest: {},
      status: 'draft',
      summary: {},
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
      const clinRefExtension = getExtension(
        serviceRequest, 'http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression',
      );
      const clinicalImpression = patientState.consultation.find(
        (consultation) => get(consultation, 'original.id') === get(clinRefExtension, 'valueReference.reference', '/')
          .split('/')[1],
      )?.original;

      if (clinicalImpression == null) {
        throw new Error(`Service Request [${serviceRequest.id}]: Clinical impression not found`);
      }

      const {
        cgh, hypothesis, precision, summary,
      } = patientState.consultation[index].parsed;

      const { requester, status } = patientState.prescriptions[index].parsed;

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
        authoredOn: get(serviceRequest, 'authoredOn'),
        code: get(serviceRequest, 'code.coding[0].code', null),
        id: serviceRequest.id,
        identifier: serviceRequest.identifier || [],
        note: get(serviceRequest, 'note[0].text', ''),
        status,
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
      draft.observations.cons = {...clinicalCons};
      draft.observations.indic = { ...clinicalIndic };
      draft.observations.summary = { ...clinicalInves };
      draft.local = {
        cgh: {
          id: get(clinicalCgh, 'id'),
          interpretation: cgh,
          precision,
        },
        clinicalImpression: {
          id: clinicalImpression.id,
        },
        cons: {
          id: get(clinicalCons, 'id'),
          value: get(clinicalCons, 'valueBoolean'),
        },
        consents: range(1, 5).map((value) => `consent-${value}`),
        eth: {
          code: get(clinicalEth, 'valueCodeableConcept.coding[0].code'),
          id: get(clinicalEth, 'id'),
          note: get(clinicalEth, 'note[0].text'),
        },
        indic: {
          id: get(clinicalIndic, 'id'),
          note: hypothesis !== NOT_AVAILABLE ? hypothesis : '',
        },
        practitioner: '',
        serviceRequest: {
          ...draft.serviceRequest,
        },
        status: serviceRequest.status,
        summary: {
          id: get(clinicalInves, 'id'),
          note: summary !== NOT_AVAILABLE ? summary : '',
        },
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
        cgh: {},
        consents: [],
        indic: {},
        practitioner: '',
        serviceRequest: {},
        summary: {},
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
