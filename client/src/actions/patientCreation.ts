import { ClinicalImpression, Patient, ServiceRequest } from '../helpers/fhir/types';

import * as actions from './type';


type Action = (...args: any) => { type: keyof typeof actions; payload?: any };

export const createPatient: Action = (patient: Patient) => ({
  payload: {
    patient,
  },
  type: actions.CREATE_PATIENT_REQUESTED,
});

export const createPatientFetus: Action = (patient: Patient, fetusGender: string) => ({
  payload: {
    fetusGender,
    patient,
  },
  type: actions.CREATE_PATIENT_FETUS_REQUESTED,
});

export const updatePatientPractitioners: Action = (
  serviceRequest: ServiceRequest,
  clinicalImpression: ClinicalImpression,
) => ({
  payload: {
    clinicalImpression,
    serviceRequest,
  },
  type: actions.UPDATE_PATIENT_PRACTITIONMERS_REQUESTED,
});

export const closeCreatePatient: Action = () => ({
  type: actions.CLOSE_CREATE_PATIENT_REQUESTED,
});

export const fetchPatientByRamq: Action = (ramq: string) => ({
  payload: {
    ramq,
  },
  type: actions.PATIENT_FETCH_INFO_BY_RAMQ,
});

export const addPatientMrn: Action = (mrn: string, organization: string) => ({
  payload: {
    mrn,
    organization,
  },
  type: actions.PATIENT_ADD_MRN_REQUESTED,
});
