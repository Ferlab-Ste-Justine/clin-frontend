import * as actions from './type';

import { Patient } from '../helpers/fhir/types';


type Action = (...args: any) => {type: keyof typeof actions, payload?: any};

export const editPatient: Action = (patient: Patient) => (
  {
    payload: { patient },
    type: actions.PATIENT_EDITION_REQUESTED,
  }
);
