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
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.ROUTER_NAVIGATION_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* navigateToPatientScreen(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    const { uid } = action.payload;
    const location = `/patient/${uid}`;
    yield put({ type: actions.PATIENT_FETCH_REQUESTED, payload: { uid } });
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED });
    LocalStore.write(LocalStore.keys.lastScreen, 'patient');
    LocalStore.write(LocalStore.keys.lastScreenState, action.payload);
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* navigateToPatientVariantScreen(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    const { uid } = action.payload;
    const location = `/patient/${uid}/variant`;
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_SUCCEEDED });
    LocalStore.write(LocalStore.keys.lastScreen, 'patient/variant');
    LocalStore.write(LocalStore.keys.lastScreenState, action.payload);
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_VARIANT_SCREEN_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* navigateToPatientSearchScreen() {
function* navigateToPatientSearchScreen(action) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    const location = '/patient/search';
    if (action.payload.reload === true) {
      yield put({ type: actions.PATIENT_SEARCH_REQUESTED, payload: { query: null } });
    }
    yield put(push(location));
    window.scrollTo(0, 0);
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED });
    LocalStore.write(LocalStore.keys.lastScreen, 'patient/search');
    LocalStore.write(LocalStore.keys.lastScreenState, null);
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* navigateToLastKnownState() {
  try {
    const screen = LocalStore.read(LocalStore.keys.lastScreen);
    const state = LocalStore.read(LocalStore.keys.lastScreenState);
    switch (screen) {
      case 'patient':
        yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_REQUESTED, payload: state });
        break;
      default:
        yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED, payload: { reload: true } });
        break;
    }
  } catch (e) {
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

function* watchNavigateToPatientVariantScreen() {
  yield takeLatest(actions.NAVIGATION_PATIENT_VARIANT_SCREEN_REQUESTED, navigateToPatientVariantScreen);
}

function* watchNavigateToLastKnownState() {
  yield takeLatest(actions.USER_SESSION_RESTORE_LAST_KNOWN_STATE, navigateToLastKnownState);
}

export default function* watchedRouterSagas() {
  yield all([
    watchNavigate(),
    watchNavigateToPatientScreen(),
    watchNavigateToPatientSearchScreen(),
    watchNavigateToPatientVariantScreen(),
    watchNavigateToLastKnownState(),
  ]);
}
