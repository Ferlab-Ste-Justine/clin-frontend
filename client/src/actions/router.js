import * as actions from './type';


export const navigate = location => ({
  type: actions.ROUTER_NAVIGATION_REQUESTED,
  payload: {
    location,
  },
});

export const navigateToPatientScreen = uid => ({
  type: actions.NAVIGATION_PATIENT_SCREEN_REQUESTED,
  payload: {
    uid,
  },
});

export const navigateToPatientVariantScreen = uid => ({
  type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_REQUESTED,
  payload: {
    uid,
  },
});

export const navigateToVariantDetailsScreen = uid => ({
  type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_REQUESTED,
  payload: {
    uid,
  },
});

export const navigateToPatientSearchScreen = (reload = true) => ({
  type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED,
  payload: {
    reload,
  },
});
