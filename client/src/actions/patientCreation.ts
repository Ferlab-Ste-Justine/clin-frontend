import { FamilyGroup, Patient } from '../helpers/fhir/types';
import * as actions from './type';

type Action = (...args:any) => {type: keyof typeof actions, payload?: any};

export const createPatient: Action = (patient: Patient, group: FamilyGroup) => (
  {
    type: actions.CREATE_PATIENT_REQUESTED,
    payload: {
      patient,
      group,
    },
  }
);

export const createPatientFetus: Action = (patient: Patient, group: FamilyGroup | undefined) => (
  {
    type: actions.CREATE_PATIENT_FETUS_REQUESTED,
    payload: {
      patient,
      group,
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
