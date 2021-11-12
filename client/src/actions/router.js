import * as actions from './type';

export const navigate = (location) => ({
  payload: {
    location,
  },
  type: actions.ROUTER_NAVIGATION_REQUESTED,
});

export const navigateToPatientScreen = (uid, { openedPrescriptionId, reload, tab } = {}) => ({
  payload: {
    openedPrescriptionId,
    reload,
    tab,
    uid,
  },
  type: actions.NAVIGATION_PATIENT_SCREEN_REQUESTED,
});

export const navigateToPatientVariantScreen = (uid, tab = null) => ({
  payload: {
    tab,
    uid,
  },
  type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_REQUESTED,
});

export const navigateToVariantDetailsScreen = (uid, tab = null) => ({
  payload: {
    tab,
    uid,
  },
  type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_REQUESTED,
});

export const navigateToAccessDeniedScreen = () => ({
  type: actions.NAVIGATION_ACCESS_DENIED_SCREEN_REQUESTED,
});

export const navigateToSubmissionScreen = () => ({
  type: actions.NAVIGATION_SUBMISSION_SCREEN_REQUESTED,
});

export const navigateToSubmissionWithPatient = () => ({
  type: actions.NAVIGATION_SUBMISSION_SCREEN_FROM_PATIENT_REQUESTED,
});

export const navigateToSubmissionFromPatientCreation = () => ({
  type: actions.NAVIGATION_SUBMISSION_SCREEN_FROM_PATIENT_CREATION,
});
