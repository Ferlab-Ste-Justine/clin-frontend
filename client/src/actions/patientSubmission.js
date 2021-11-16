import * as actions from './type';

export const savePatientSubmission = (patientSubmission) => ({
  payload: patientSubmission,
  type: actions.PATIENT_SUBMISSION_SAVE_REQUESTED,
});

export const saveLocalPractitioner = (practitioner) => ({
  payload: {
    practitioner,
  },
  type: actions.PATIENT_SUBMISSION_LOCAL_PRACTITIONER,
});

export const saveLocalSupervisor = (supervisor) => ({
  payload: {
    supervisor,
  },
  type: actions.PATIENT_SUBMISSION_LOCAL_SUPERVISOR,
});

export const saveLocalResident = (resident) => ({
  payload: {
    resident,
  },
  type: actions.PATIENT_SUBMISSION_LOCAL_RESIDENT,
});

export const assignServiceRequestPractitioner = (resource) => (
  {
    payload: resource,
    type: actions.PATIENT_SUBMISSION_ASSIGN_PRACTITIONER,
  }
);

export const assignServiceRequestResident = (resource) => (
  {
    payload: resource,
    type: actions.PATIENT_SUBMISSION_ASSIGN_RESIDENT,
  }
);

export const editPrescription = (id) => ({
  payload: {
    id,
  },
  type: actions.EDIT_PRESCRIPTION_REQUESTED,
});
