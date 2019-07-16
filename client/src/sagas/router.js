import { push } from 'connected-react-router';
import { all, put, takeLatest } from 'redux-saga/effects';

import * as actions from '../actions/type';
import LocalStore from '../helpers/storage/local';


function* navigate(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    const { location } = action.payload;
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.ROUTER_NAVIGATION_SUCCEEDED });
    LocalStore.write(LocalStore.keys.location, location);
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.ROUTER_NAVIGATION_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* navigateToPatientScreen(action) {
  try {
    const { uid } = action.payload;
    const location = `/patient/${uid}`;
    yield put({ type: actions.START_LOADING_ANIMATION });
    yield put({ type: actions.PATIENT_FETCH_REQUESTED, payload: { uid } });
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED });
    LocalStore.write(LocalStore.keys.location, location);
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* navigateToPatientSearchScreen() {
  try {
    const location = '/patient/search';
    yield put({ type: actions.START_LOADING_ANIMATION });
    yield put({ type: actions.PATIENT_SEARCH_REQUESTED, payload: { query: null } });
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED });
    LocalStore.write(LocalStore.keys.location, location);
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
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

export default function* watchedRouterSagas() {
  yield all([
    watchNavigate(),
    watchNavigateToPatientScreen(),
    watchNavigateToPatientSearchScreen(),
  ]);
}
