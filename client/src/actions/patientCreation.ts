import { FamilyGroup, Patient } from '../helpers/fhir/types';
import * as actions from './type';

export const createPatient = (patient: Patient, group: FamilyGroup) => (
  {
    type: actions.CREATE_PATIENT_REQUESTED,
    payload: {
      patient,
      group,
    },
  }
);

export const closeCreatePatient = () => (
  {
    type: actions.CLOSE_CREATE_PATIENT_REQUESTED,
  }
);
