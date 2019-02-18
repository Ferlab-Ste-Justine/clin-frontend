import { call, put, takeLatest } from 'redux-saga/effects';
import * as ACTIONS from '../constants/ActionTypes';

/* Example */
function* fetchUser(action) {
    try {
        yield put({type: ACTIONS.SHOW_LOADING});
        const user = yield call(new Promise.resolve(), action);
        yield put({type: ACTIONS.USER_FETCH_SUCCEEDED, user: user});
    } catch (e) {
        yield put({type: ACTIONS.USER_FETCH_FAILED, message: e.message});
    }
}

function* sagas() {
    yield takeLatest(ACTIONS.USER_FETCH_REQUESTED, fetchUser);
}

export default sagas;