import { push } from 'connected-react-router';
import { all, put, takeLatest } from 'redux-saga/effects';

import * as actions from '../actions/type';

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

function* navigateToVariantDetailsScreen(action) {
  try {
    const { uid } = action.payload;
    const location = `/variantDetails/${uid}`;
    yield put({ type: actions.VARIANT_DETAILS_REQUESTED, payload: { uid } });
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_VARIANT_DETAILS_SCREEN_FAILED, message: e.message });
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

function* watchNavigateToVariantDetailsScreen() {
  yield takeLatest(actions.NAVIGATION_VARIANT_DETAILS_SCREEN_REQUESTED, navigateToVariantDetailsScreen);
}

export default function* watchedRouterSagas() {
  yield all([
    watchNavigate(),
    watchNavigateToPatientScreen(),
    watchNavigateToPatientSearchScreen(),
    watchNavigateToPatientVariantScreen(),
    watchNavigateToVariantDetailsScreen(),
  ]);
}
