import { push, LOCATION_CHANGE } from 'connected-react-router';
import get from 'lodash/get';
import {
  all, select, put, takeLatest, delay, takeEvery,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import {
  getPatientIdFromPatientPageRoute,
  ROUTE_NAME_ROOT,
  ROUTE_NAME_PATIENT,
  PATIENT_SUBROUTE_SEARCH,
  ROUTE_NAME_VARIANT,
} from '../helpers/route';

function* navigateToVariantDetailsScreen(action) {
  try {
    const { uid, tab } = action.payload;
    let url = `${ROUTE_NAME_ROOT}${ROUTE_NAME_VARIANT}/${uid}`;
    if (tab) { url += `/#${tab}`; }

    yield put(push(url));
  } catch (e) {
    yield put({ type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientScreen(action) {
  try {
    const { uid, tab, reload } = action.payload;
    let url = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/${uid}`;
    if (tab) { url += `/#${tab}`; }
    if (reload) {
      url += '?reload';
    }

    yield put(push(url));
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToPatientVariantScreen(action) {
  try {
    const { uid } = action.payload;
    const url = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/${uid}#variant`;

    yield put(push(url));
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

function* navigateToSubmissionScreenWithPatientProcess(patient) {
  try {
    yield put({ type: actions.PATIENT_SUBMISSION_FROM_PATIENT, payload: { patient } });
    yield put(push(yield put(push('/submission'))));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_SUBMISSION_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_SUBMISSION_SCREEN_FAILED, message: e.message });
  }
}

function* navigateToEditSubmission() {
  try {
    yield put(push(yield put(push('/submission'))));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_EDIT_SUBMISSION_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_EDIT_SUBMISSION_FAILED, message: e.message });
  }
}

function* navigateToSubmissionScreenFromPatientCreation() {
  const patient = yield select((state) => state.patientCreation.patient);
  yield navigateToSubmissionScreenWithPatientProcess({ patient: { original: patient } });
}

function* navigateToSubmissionScreenWithPatient() {
  const patient = yield select((state) => state.patient);
  yield navigateToSubmissionScreenWithPatientProcess(patient);
}

function* navigateToPatientSearchScreen() {
  yield put(push(`${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/${PATIENT_SUBROUTE_SEARCH}`));
}

function* navigateToAccessDeniedScreen() {
  try {
    yield put(push('/access-denied'));
    yield put({ type: actions.NAVIGATION_ACCESS_DENIED_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_ACCESS_DENIED_SCREEN_FAILED });
  }
}

function* processPatientPage(currentRoute, tab, forceReload) {
  try {
    const uid = getPatientIdFromPatientPageRoute(currentRoute);
    const currentPatientId = yield select((state) => state.patient.patient.parsed.id);
    if (uid !== currentPatientId || forceReload) {
      yield put({
        type: actions.PATIENT_FETCH_REQUESTED,
        payload: { uid },
      });
      yield delay(250);
    }
    if (tab === 'variant') {
      yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_SUCCEEDED });
    }
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_FAILED });
  }
}

function* processPatientSearchPage() {
  try {
    yield put({ type: actions.CLEAR_PATIENT_DATA_REQUESTED });
    yield put({ type: actions.PATIENT_SEARCH_REQUESTED, payload: { query: null } });
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED });
  }
}

function* manualUserNavigation(action) {
  window.scrollTo(0, 0);
  const { referrer, isFirstRendering } = yield select((state) => state.app);
  const location = !referrer.location || !isFirstRendering ? action.payload.location : referrer.location;
  const { pathname, search, hash } = location;
  const urlIsRewrite = (pathname === '/' && search.indexOf('?redirect=') !== -1);
  const route = urlIsRewrite ? search.split('?redirect=')[1] + hash : `${pathname || ''}${hash || ''}`;
  if (urlIsRewrite) {
    yield put(push(route));
    return;
  }
  const forceReload = (location.search || '').includes('reload') || get(location, 'query.reload') != null;
  let tab = '';
  if (hash) {
    tab = hash.replace('#', '');
    if (tab && tab.indexOf('?') > -1) {
      tab = tab.substring(0, tab.indexOf('?'));
    }
    if (tab && tab.indexOf('&') > -1) {
      tab = tab.substring(0, tab.indexOf('&'));
    }
    if (tab && tab.indexOf('=') > -1) {
      // Tab should not be formatted as a 'key=value'; it is not a param.
      tab = '';
    }
  }

  if (isFirstRendering) {
    yield put({ type: actions.USER_PROFILE_REQUESTED });
    yield put({ type: actions.USER_IDENTITY_REQUESTED });
  }

  yield put({ type: actions.SET_IS_FIRST_RENDERING, payload: { isFirstRendering: false } });

  const currentRoute = route || location.pathname;
  if (currentRoute.startsWith('/patient/search')) {
    yield processPatientSearchPage();
  } else if (currentRoute.startsWith('/variantDetails')) {
    yield put({ type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_SUCCEEDED });
  } else if (currentRoute.startsWith('/patient/')) {
    yield processPatientPage(currentRoute, tab, forceReload);
  } else if (currentRoute.startsWith('/submission') && !isFirstRendering) {
    // ignore /submission page to not change the current flow on "normal" navigation
  } else {
    yield navigateToPatientSearchScreen();
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

function* watchNavigateToPatientScreenWithPatient() {
  yield takeLatest(actions.NAVIGATION_SUBMISSION_SCREEN_FROM_PATIENT_REQUESTED, navigateToSubmissionScreenWithPatient);
}

function* watchNavigateToPatientScreenFromPatientCreationt() {
  yield takeLatest(
    actions.NAVIGATION_SUBMISSION_SCREEN_FROM_PATIENT_CREATION, navigateToSubmissionScreenFromPatientCreation,
  );
}

function* watchNavigationToAccessDeniedScreen() {
  yield takeLatest(actions.NAVIGATION_ACCESS_DENIED_SCREEN_REQUESTED, navigateToAccessDeniedScreen);
}

function* watchNavigationToEditSubmission() {
  yield takeLatest(actions.NAVIGATION_EDIT_SUBMISSION_REQUESTED, navigateToEditSubmission);
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
    watchNavigateToPatientScreenWithPatient(),
    watchNavigateToPatientScreenFromPatientCreationt(),
    watchNavigationToEditSubmission(),
  ]);
}
