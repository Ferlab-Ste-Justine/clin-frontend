import { put, takeLatest } from 'redux-saga/effects';
import { updateIntl } from 'react-intl-redux'

import * as actions from '../actions/type';
import locales from '../locales';

export function* loadApp(action) {
    yield put({type: actions.START_LOADING_ANIMATION});
    try {
        yield put({type: actions.APP_FETCH_SUCCEEDED});
        yield put({type: actions.APP_CHANGE_LANGUAGE_REQUESTED, payload:{ language: 'fr' }});
        yield put({type: actions.STOP_LOADING_ANIMATION});
    } catch (e) {
        yield put({type: actions.APP_FETCH_FAILED, message: e.message});
        yield put({type: actions.STOP_LOADING_ANIMATION});
    }
}

export function* changeLanguage(action) {
    try {
       yield put({type: actions.APP_CHANGE_LANGUAGE_SUCCEEDED, language: action.payload.language});
       yield put(updateIntl({
            locale: action.payload.language,
            messages: locales[action.payload.language],
       }));

    } catch (e) {
        yield put({type: actions.APP_CHANGE_LANGUAGE_FAILED, message: e.message});
    }
}

function* watchLoadApp() {
    yield takeLatest(actions.APP_FETCH_REQUESTED, loadApp);
}

function* watchChangeAppLanguage() {
    yield takeLatest(actions.APP_CHANGE_LANGUAGE_REQUESTED, changeLanguage);
}

export default {
    changeLanguageSaga: watchChangeAppLanguage,
    loadApplicationSaga: watchLoadApp,
};
