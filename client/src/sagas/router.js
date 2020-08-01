import { push, LOCATION_CHANGE } from 'connected-react-router';
import {
  all, select, put, takeLatest, delay, takeEvery,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import {
  isPatientSearchRoute,
  isPatientPageRoute,
  isPatientVariantPageRoute,
  isVariantPageRoute,
  getPatientIdFromPatientPageRoute,
  getPatientIdFromPatientVariantPageRoute,
  getVariantIdFromVariantPageRoute,
  ROUTE_NAME_ROOT,
  ROUTE_NAME_PATIENT,
  PATIENT_SUBROUTE_SEARCH,
  PATIENT_SUBROUTE_VARIANT,
  ROUTE_NAME_VARIANT,
} from '../helpers/route';


function* navigateToVariantDetailsScreen(action) {
  try {
    const { uid, tab } = action.payload;
    let url = `${ROUTE_NAME_ROOT}${ROUTE_NAME_VARIANT}/${uid}`;
    if (tab) { url += `/#${tab}`; }

    yield put(push(url));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientScreen(action) {
  try {
    const { uid, tab } = action.payload;
    let url = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/${uid}`;
    if (tab) { url += `/#${tab}`; }

    // @NOTE Only fetch patient if it is not the currently active one
    const { details } = yield select(state => state.patient);
    if (uid !== details.id) {
      yield put({
        type: actions.PATIENT_FETCH_REQUESTED,
        payload: { uid },
      });
      yield delay(250);
    }

    yield put(push(url));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientVariantScreen(action) {
  try {
    const { uid, tab } = action.payload;
    let url = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/${uid}/${PATIENT_SUBROUTE_VARIANT}`;
    if (tab) { url += `/#${tab}`; }

    // @NOTE Only fetch patient if it is not the currently active one
    const { details } = yield select(state => state.patient);
    if (uid !== details.id) {
      yield put({
        type: actions.PATIENT_FETCH_REQUESTED,
        payload: { uid },
      });
      yield delay(250);
    }

    yield put(push(url));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToSubmissionScreen() {
  try {
    yield put(push(yield put(push('/submission'))));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_SUBMISSION_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_SUBMISSION_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientSearchScreen() {
  try {
    yield put({ type: actions.PATIENT_SEARCH_REQUESTED, payload: { query: null } });
    yield put(push(`${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/${PATIENT_SUBROUTE_SEARCH}`));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED });
  }
}

function* navigateToAccessDeniedScreen() {
  try {
    yield put(push('/access-denied'));
    yield put({ type: actions.NAVIGATION_ACCESS_DENIED_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_ACCESS_DENIED_SCREEN_FAILED });
  }
}

function* manualUserNavigation(action) {
  const { isFirstRendering } = action.payload;

  if (isFirstRendering) {
    const { referrer } = yield select(state => state.app);
    const location = !referrer.location ? action.payload : referrer.location;
    const { pathname, search, hash } = location;
    const urlIsRewrite = (pathname === '/' && search.indexOf('?redirect=') !== -1);
    const route = urlIsRewrite ? search.split('?redirect=')[1] + hash : pathname + hash;
    const tab = hash.replace('#', '');

    yield put({ type: actions.USER_PROFILE_REQUESTED });
    yield put({ type: actions.USER_IDENTITY_REQUESTED });

    if (isPatientSearchRoute(route) === true) {
      yield navigateToPatientSearchScreen();
    } else if (isPatientVariantPageRoute(route) === true) {
      const patientId = getPatientIdFromPatientVariantPageRoute(route);
      yield navigateToPatientVariantScreen({ payload: { uid: patientId, tab } });
    } else if (isPatientPageRoute(route) === true) {
      const patientId = getPatientIdFromPatientPageRoute(route);
      yield navigateToPatientScreen({ payload: { uid: patientId, tab } });
    } else if (isVariantPageRoute(route) === true) {
      const variantId = getVariantIdFromVariantPageRoute(route);
      yield navigateToVariantDetailsScreen({ payload: { uid: variantId, tab } });
    } else {
      yield navigateToPatientSearchScreen();
    }
  }
}

function* watchManualUserNavigation() {
  yield takeEvery([
    LOCATION_CHANGE,
  ], manualUserNavigation);
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

function* watchNavigateToSubmissionScreen() {
  yield takeLatest(actions.NAVIGATION_SUBMISSION_SCREEN_REQUESTED, navigateToSubmissionScreen);
}


function* watchNavigationToAccessDeniedScreen() {
  yield takeLatest(actions.NAVIGATION_ACCESS_DENIED_SCREEN_REQUESTED, navigateToAccessDeniedScreen);
}

export default function* watchedRouterSagas() {
  yield all([
    watchNavigateToPatientScreen(),
    watchNavigateToPatientSearchScreen(),
    watchNavigateToPatientVariantScreen(),
    watchNavigateToVariantDetailsScreen(),
    watchNavigationToAccessDeniedScreen(),
    watchManualUserNavigation(),
    watchNavigateToSubmissionScreen(),
  ]);
}
