import * as actions from './type';


// eslint-disable-next-line import/prefer-default-export
export const savePatientSubmission = patientSubmission => ({
  type: actions.PATIENT_SUBMISSION_SAVE_REQUESTED,
  payload: patientSubmission,
});

export const savePatientLocal = patient => ({
  type: actions.PATIENT_SUBMISSION_LOCAL_SAVE_REQUESTED,
  payload: patient,
});

export const addHpoResource = resource => ({
  type: actions.PATIENT_SUBMISSION_ADD_HPO_RESOURCE,
  payload: resource,
});

export const setHpoResourceDeletionFlag = ({ code, toDelete }) => ({
  type: actions.PATIENT_SUBMISSION_MARK_HPO_FOR_DELETION,
  payload: {
    code,
    toDelete,
  },
});

export const addFamilyHistoryResource = resource => ({
  type: actions.PATIENT_SUBMISSION_ADD_FAMILY_RELATIONSHIP_RESOURCE,
  payload: resource,
});


export const addEmptyFamilyHistory = () => ({
  type: actions.PATIENT_SUBMISSION_ADD_EMPTY_FAMILY_RELATIONSHIP,
  payload: {},
});

export const setFamilyRelationshipResourceDeletionFlag = deleted => ({
  type: actions.PATIENT_SUBMISSION_MARK_FAMILY_RELATIONSHIP_FOR_DELETION,
  payload: {
    deleted,
  },
});

export const assignServiceRequestPractitioner = resource => (
  {
    type: actions.PATIENT_SUBMISSION_ASSIGN_PRACTITIONER,
    payload: resource,
  }
);
