import { ClinicalImpression, Patient, ServiceRequest } from '../helpers/fhir/types';
import * as actions from './type';

type Action = (...args: any) => {type: keyof typeof actions, payload?: any};

export const createPatient: Action = (patient: Patient) => (
  {
    type: actions.CREATE_PATIENT_REQUESTED,
    payload: {
      patient,
    },
  }
);

export const createPatientFetus: Action = (patient: Patient) => (
  {
    type: actions.CREATE_PATIENT_FETUS_REQUESTED,
    payload: {
      patient,
    },
  }
);

export const updatePatientPractitioners: Action = (
  serviceRequest: ServiceRequest, clinicalImpression: ClinicalImpression,
) => (
  {
    type: actions.UPDATE_PATIENT_PRACTITIONMERS_REQUESTED,
    payload: {
      serviceRequest,
      clinicalImpression,
    },
  }
);

export const closeCreatePatient: Action = () => (
  {
    type: actions.CLOSE_CREATE_PATIENT_REQUESTED,
  }
);

export const fetchPatientByRamq: Action = (ramq: string) => ({
  type: actions.PATIENT_FETCH_INFO_BY_RAMQ,
  payload: {
    ramq,
  },
});

export const addPatientMrn: Action = (mrn: string, organization: string) => ({
  type: actions.PATIENT_ADD_MRN_REQUESTED,
  payload: {
    mrn,
    organization,
  },
});
