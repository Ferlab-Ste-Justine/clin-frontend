import * as actions from './type';

export const navigate = location => ({
  type: actions.ROUTER_NAVIGATION_REQUESTED,
  payload: {
    location,
  },
});

export const navigateToLastKnownState = (screen, state) => ({
  type: actions.USER_SESSION_RESTORE_LAST_KNOWN_STATE,
  payload: {
    screen,
    state,
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


export const navigateToPatientSearchScreen = (reload = false) => ({
  type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED,
  payload: {
    reload,
  },
});
