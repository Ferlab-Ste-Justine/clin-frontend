import { call, put, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions/type';

/*
export const fetchUser = (uid) => {
    return {
        type: Actions.USER_FETCH_REQUESTED,
        payload: uid,
    };
};
*/

export function* fetchUser(action) {
    yield put({type: actions.START_LOADING_ANIMATION});
    try {
        const user = yield call(new Promise.resolve(), action);
        yield put({type: actions.USER_FETCH_SUCCEEDED, user: user});
    } catch (e) {
        yield put({type: actions.USER_FETCH_FAILED, message: e.message});
    }
    yield put({type: actions.STOP_LOADING_ANIMATION});
}

function* watchFetchUser() {
    yield takeLatest(actions.USER_FETCH_REQUESTED, fetchUser);
}

export default watchFetchUser;