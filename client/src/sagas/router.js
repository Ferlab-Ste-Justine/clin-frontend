import { push } from 'connected-react-router';
import { all, put, takeLatest } from 'redux-saga/effects';

import * as actions from '../actions/type';


function* navigate(data) {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    yield put(push(data.payload.location));
    yield put({ type: actions.ROUTER_NAVIGATION_SUCCEEDED });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  } catch (e) {
    yield put({ type: actions.ROUTER_NAVIGATION_FAILED, message: e.message });
    yield put({ type: actions.STOP_LOADING_ANIMATION });
  }
}

function* watchNavigate() {
  yield takeLatest(actions.ROUTER_NAVIGATION_REQUESTED, navigate);
}

export default function* watchedRouterSagas() {
  yield all([
    watchNavigate(),
  ]);
}
