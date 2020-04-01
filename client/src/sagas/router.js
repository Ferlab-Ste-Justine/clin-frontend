import { push, LOCATION_CHANGE } from 'connected-react-router';
import {
  all, select, put, takeLatest, takeEvery, delay,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import {
  isPatientSearchRoute,
  isPatientPageRoute,
  isPatientVariantPageRoute,
  getPatientIdFromPatientPageRoute,
  getPatientIdFromPatientVariantPageRoute,
  isVariantPageRoute,
  getVariantIdFromVariantPageRoute,
  ROUTE_NAME_PATIENT,
  PATIENT_SUBROUTE_SEARCH,
  PATIENT_SUBROUTE_VARIANT,
  ROUTE_NAME_VARIANT,
} from '../helpers/route';

function* navigateToVariantDetailsScreen(action) {
  try {
    const { uid } = action.payload;
    yield put(push(`/${ROUTE_NAME_VARIANT}/${uid}`));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientScreen(action) {
  try {
    const { uid } = action.payload;

    // @NOTE Only fetch patient if it is not the currently active one
    const { details } = yield select(state => state.patient);
    if (uid !== details.id) {
      yield put({
        type: actions.PATIENT_FETCH_REQUESTED,
        payload: { uid },
      });
      yield delay(250);
    }

    yield put(push(`/${ROUTE_NAME_PATIENT}/${uid}`));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientVariantScreen(action) {
  try {
    const { uid } = action.payload;

    // @NOTE Only fetch patient if it is not the currently active one
    const { details } = yield select(state => state.patient);
    if (uid !== details.id) {
      yield put({
        type: actions.PATIENT_FETCH_REQUESTED,
        payload: { uid },
      });
      yield delay(250);
    }

    yield put(push(`/${ROUTE_NAME_PATIENT}/${uid}/${PATIENT_SUBROUTE_VARIANT}`));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientSearchScreen() {
  try {
    yield put({ type: actions.PATIENT_SEARCH_REQUESTED, payload: { query: null } });
    yield put(push(`/${ROUTE_NAME_PATIENT}/${PATIENT_SUBROUTE_SEARCH}`));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED });
  }
}

function* manualUserNavigation(action) {
  const { isFirstRendering } = action.payload;
  if (isFirstRendering) {
    yield put({ type: actions.START_LOADING_ANIMATION });
    yield put({ type: actions.START_SUBLOADING_ANIMATION });
    const location = action.payload.location.pathname.replace('/#/', '/');

    if (isPatientSearchRoute(location) === true) {
      yield navigateToPatientSearchScreen();
    } else if (isPatientVariantPageRoute(location) === true) {
      const patientId = getPatientIdFromPatientVariantPageRoute(location);
      yield navigateToPatientVariantScreen({ payload: { uid: patientId } });
    } else if (isPatientPageRoute(location) === true) {
      const patientId = getPatientIdFromPatientPageRoute(location);
      yield navigateToPatientScreen({ payload: { uid: patientId } });
    } else if (isVariantPageRoute(location) === true) {
      const variantId = getVariantIdFromVariantPageRoute(location);
      yield navigateToVariantDetailsScreen({ payload: { uid: variantId } });
    }
    yield put({ type: actions.STOP_SUBLOADING_ANIMATION });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* watchManualUserNavigation() {
  yield takeEvery(LOCATION_CHANGE, manualUserNavigation);
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

function* watchNavigateToVariantDetailsScreen() {
  yield takeLatest(actions.NAVIGATION_VARIANT_DETAILS_SCREEN_REQUESTED, navigateToVariantDetailsScreen);
}

export default function* watchedRouterSagas() {
  yield all([
    watchNavigateToPatientScreen(),
    watchNavigateToPatientSearchScreen(),
    watchNavigateToPatientVariantScreen(),
    watchNavigateToVariantDetailsScreen(),
    watchManualUserNavigation(),
  ]);
}
