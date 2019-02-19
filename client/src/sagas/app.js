import { all, call, put, takeLatest } from 'redux-saga/effects';
import { addLocaleData } from 'react-intl'
import { updateIntl } from 'react-intl-redux'
import fr from 'react-intl/locale-data/fr';
import en from 'react-intl/locale-data/en';

import * as actions from '../actions/type';

const locales = {
    fr: {
        'home.greeting': 'Bonjour'
    },
    en: {
        'home.greeting': 'Hello'
    },
};
addLocaleData([...fr, ...en]);

export function* loadApp(action) {
    yield put({type: actions.START_LOADING_ANIMATION});
    try {
        const app = yield {};
        yield all([
            put({type: actions.APP_FETCH_SUCCEEDED, payload: app}),
            put({type: actions.APP_CHANGE_LANGUAGE_REQUESTED, payload:{ language: 'fr' } }),
            put({type: actions.STOP_LOADING_ANIMATION})
        ]);
    } catch (e) {
        yield all([
            put({type: actions.APP_FETCH_FAILED, message: e.message}),
            put({type: actions.STOP_LOADING_ANIMATION})
        ]);
    }
}

export function* changeLanguage(action) {
    try {
        yield all([
            put({type: actions.APP_CHANGE_LANGUAGE_SUCCEEDED, language: action.payload.language}),
            put(updateIntl({
                locale: action.payload.language,
                messages: locales[action.payload.language],
            })),
        ]);
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
