import { LOCATION_CHANGE,push } from 'connected-react-router';
import get from 'lodash/get';
import {
  all,
  delay,
  put,
  select,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import {
  Routes,
} from '../helpers/route';

function* navigateToVariantDetailsScreen(action) {
  try {
    const { tab, uid } = action.payload;
    let url = Routes.getVariantPath(uid);
    if (tab) { url += `/#${tab}`; }

    yield put(push(url));
  } catch (e) {
    yield put({ message: e.message, type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_FAILED });
  }
}

function* navigateToPatientScreen(action) {
  try {
    const { reload, tab, uid } = action.payload;
    let url = Routes.getPatientPath(uid, tab);

    if (reload) {
      url += '?reload';
    }

    yield put({ payload: { activeKey: tab }, type: actions.PATIENT_SET_CURRENT_ACTIVE_KEY });
    yield put(push(url));
  } catch (e) {
    yield put({ message: e.message, type: actions.NAVIGATION_PATIENT_SCREEN_FAILED });
  }
}

function* navigateToPatientVariantScreen(action) {
  try {
    const { uid } = action.payload;
    const url = Routes.getPatientPath(uid, 'variant');

    yield put(push(url));
  } catch (e) {
    yield put({ message: e.message, type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_FAILED });
  }
}

function* navigateToSubmissionScreen() {
  try {
    yield put(push(yield put(push(Routes.Submission))));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_SUBMISSION_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ message: e.message, type: actions.NAVIGATION_SUBMISSION_SCREEN_FAILED });
  }
}

function* navigateToSubmissionScreenWithPatientProcess(patient) {
  try {
    yield put({ payload: { patient }, type: actions.PATIENT_SUBMISSION_FROM_PATIENT });
    yield put(push(yield put(push(Routes.Submission))));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_SUBMISSION_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ message: e.message, type: actions.NAVIGATION_SUBMISSION_SCREEN_FAILED });
  }
}

function* navigateToEditSubmission() {
  try {
    yield put(push(yield put(push(Routes.Submission))));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_EDIT_SUBMISSION_SUCCEEDED });
  } catch (e) {
    yield put({ message: e.message, type: actions.NAVIGATION_EDIT_SUBMISSION_FAILED });
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
  yield put(push(Routes.PatientSearch));
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
    const uid = Routes.getPatientIdFromPatientPageRoute(currentRoute);
    const currentPatientId = yield select((state) => state.patient.patient.parsed.id);
    if (uid !== currentPatientId || forceReload) {
      yield put({
        payload: { uid },
        type: actions.PATIENT_FETCH_REQUESTED,
      });
      yield delay(250);
    }
    if (tab === 'variant') {
      yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_SUCCEEDED });
    }
    yield put({ payload: { activeKey: tab }, type: actions.PATIENT_SET_CURRENT_ACTIVE_KEY });
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_FAILED });
  }
}

function* processPatientSearchPage() {
  try {
    yield put({ type: actions.CLEAR_PATIENT_DATA_REQUESTED });
    yield put({ payload: { query: null }, type: actions.PATIENT_SEARCH_REQUESTED });
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED });
  }
}

function* manualUserNavigation(action) {
  // this is a catch all function
  // As soon as the react-router gets and event, it will be triggered

  const { isFirstRendering } = action.payload;
  window.scrollTo(0, 0);
  const { referrer } = yield select((state) => state.app);

  const location = !referrer.location || !isFirstRendering ? action.payload.location : referrer.location;
  const { hash, pathname, search } = location;
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

  const currentRoute = (route || location.pathname).split('#')[0];
  const isCurrentRoute = (route) => !!currentRoute.match(new RegExp(`${route}`, 'gi'));

  if (isCurrentRoute(Routes.PatientSearchArranger)) {
    // do nothing
  } else if (isCurrentRoute(Routes.PatientSearch)) {
    yield processPatientSearchPage();
  } else if (isCurrentRoute(Routes.Variant)) {
    yield put({ type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_SUCCEEDED });
  } else if (isCurrentRoute(`${Routes.Patient}\/([\\w,\\-]+)\/?`)) {
    yield processPatientPage(currentRoute, tab, forceReload);
  } else if (isCurrentRoute(Routes.AccessDenied)) {
    // Access denied
  } else if (isCurrentRoute(Routes.Submission) && !isFirstRendering) {
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
