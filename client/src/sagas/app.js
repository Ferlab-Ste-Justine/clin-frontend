import { all, call, put, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions/type';

function delay(ms) {
    return new Promise(resolve => setTimeout(() => resolve(true), ms))
}

export function* loadApp(action) {
    yield put({type: actions.START_LOADING_ANIMATION});
    try {
        const app = yield call(delay, 1000);
        yield all([
            put({type: actions.APP_FETCH_SUCCEEDED, app: app}),
            put({type: actions.STOP_LOADING_ANIMATION})
        ]);
    } catch (e) {
        yield all([
            put({type: actions.APP_FETCH_FAILED, message: e.message}),
            put({type: actions.STOP_LOADING_ANIMATION})
        ]);
    }
}

function* watchLoadApp() {
    yield takeLatest(actions.APP_FETCH_REQUESTED, loadApp);
}

export default watchLoadApp;