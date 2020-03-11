import { push, LOCATION_CHANGE } from 'connected-react-router';
import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import {
  isPatientSearchRoute, isPatientPageRoutePattern, isPatientVariantPageRoutePattern, getPatientIdFromPatientPageRoute, getPatientIdFromPatientVariantPageRoute,
} from '../helpers/route';

function* navigateToPatientScreen(action) {
  try {
    const { uid } = action.payload;
    const location = `/patient/${uid}`;
    yield put({ type: actions.PATIENT_FETCH_REQUESTED, payload: { uid } });
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientVariantScreen(action) {
  try {
    const { uid } = action.payload;
    const location = `/patient/${uid}/variant`;
    yield put({ type: actions.PATIENT_FETCH_REQUESTED, payload: { uid } });
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientSearchScreen() {
  try {
    const location = '/patient/search';
    yield put({ type: actions.PATIENT_SEARCH_REQUESTED, payload: { query: null } });
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED });
  }
}

function* manualUserNavigation(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  yield put({ type: actions.START_SUBLOADING_ANIMATION });
  const location = action.payload.location.pathname;
  if (isPatientVariantPageRoutePattern(location)) {
    const patientId = getPatientIdFromPatientPageRoute(location);
    yield navigateToPatientVariantScreen({ payload: { uid: patientId } });
  } else if (isPatientPageRoutePattern(location)) {
    const patientId = getPatientIdFromPatientVariantPageRoute(location);
    yield navigateToPatientScreen({ payload: { uid: patientId } });
  } else if (isPatientSearchRoute(location)) {
    yield navigateToPatientSearchScreen();
  }
  yield put({ type: actions.STOP_SUBLOADING_ANIMATION });
  yield put({ type: actions.STOP_LOADING_ANIMATION });
}

function* watchManualUserNavigation() {
  yield takeLatest(LOCATION_CHANGE, manualUserNavigation);
}

function* watchNavigateToPatientScreen() {
  yield takeLatest(actions.NAVIGATION_PATIENT_SCREEN_REQUESTED, navigateToPatientScreen);
}

function* watchNavigateToPatientSearchScreen() {
  yield takeLatest(actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED, navigateToPatientSearchScreen);
}

function* watchNavigateToPatientVariantScreen() {
  yield takeLatest(actions.NAVIGATION_PATIENT_VARIANT_SCREEN_REQUESTED, navigateToPatientVariantScreen);
}

export default function* watchedRouterSagas() {
  yield all([
    watchNavigateToPatientScreen(),
    watchNavigateToPatientSearchScreen(),
    watchNavigateToPatientVariantScreen(),
    watchManualUserNavigation(),
  ]);
}
