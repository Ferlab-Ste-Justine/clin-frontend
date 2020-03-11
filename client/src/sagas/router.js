import { push, LOCATION_CHANGE } from 'connected-react-router';
import {
  all, put, takeLatest, call,
} from 'redux-saga/effects';

import * as actions from '../actions/type';
import { fetchPatient, searchPatientsByQuery } from '../actions/patient';
import {
  isPatientSearchRoute, isPatientPageRoutePattern, isPatientVariantPageRoutePattern, getPatientIdFromPatientPageRoute, getPatientIdFromPatientVariantPageRoute,
} from '../helpers/route';


function* navigate(action) {
  try {
    const { location } = action.payload;
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.ROUTER_NAVIGATION_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.ROUTER_NAVIGATION_FAILED, message: e.message });
  }
}

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
  const isPageReload = action.payload.isFirstRendering === true;
  const location = action.payload.location.pathname;

  if (isPatientVariantPageRoutePattern(location)) {
    console.log('+ isPatientVariantPageRoutePattern');
    const patientId = getPatientIdFromPatientPageRoute(location);


    console.log(`+ isPatientVariantPageRoutePattern patientId ${JSON.stringify(patientId)}`);


    yield fetchPatient(patientId);
    yield navigateToPatientVariantScreen({ payload: { uid: patientId } });
  } else if (isPatientPageRoutePattern(location)) {
    console.log('+ isPatientPageRoutePattern');
    const patientId = getPatientIdFromPatientVariantPageRoute(location);


    console.log(`+ isPatientPageRoutePattern patientId ${JSON.stringify(patientId)}`);


    yield navigateToPatientScreen({ payload: { uid: patientId } });
  } else if (isPatientSearchRoute(location)) {
    console.log('+ isPatientSearchRoute');

    yield call(searchPatientsByQuery);
  } else {
    // @TODO
  }

  yield console.log(`+ isPageReload ${JSON.stringify(isPageReload)}`);
  yield console.log(`+ ${JSON.stringify(action.payload)}`);

  /*
  + TEST {
  "type":"@@router/LOCATION_CHANGE",
  "payload":{
    "location":{
      "pathname":"/patient/search",
      "search":"",
      "hash":"",
      "key":"w1lwzc"},
    "action":"POP",
    "isFirstRendering":true}}
   */
}

function* watchManualUserNavigation() {
  yield takeLatest(LOCATION_CHANGE, manualUserNavigation);
}

function* watchNavigate() {
  yield takeLatest(actions.ROUTER_NAVIGATION_REQUESTED, navigate);
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
    watchNavigate(),
    watchNavigateToPatientScreen(),
    watchNavigateToPatientSearchScreen(),
    watchNavigateToPatientVariantScreen(),
    watchManualUserNavigation(),
  ]);
}
