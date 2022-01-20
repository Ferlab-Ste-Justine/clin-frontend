import * as actions from './type';

export const navigate = (location) => ({
  type: actions.ROUTER_NAVIGATION_REQUESTED,
  payload: {
    location,
  },
});

export const navigateToPatientScreen = (uid, { tab, reload, openedPrescriptionId } = {}) => ({
  type: actions.NAVIGATION_PATIENT_SCREEN_REQUESTED,
  payload: {
    uid,
    tab,
    reload,
    openedPrescriptionId,
  },
});

export const navigateToPatientSearchScreen = (reload = true) => ({
  type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED,
  payload: {
    reload,
  },
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
