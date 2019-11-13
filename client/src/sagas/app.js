import { all, put, takeLatest } from 'redux-saga/effects';
import { updateIntl } from 'react-intl-redux';

import * as actions from '../actions/type';
import { error } from '../actions/app';
import locales from '../locales';


function* loadApp() {
  yield put({ type: actions.START_LOADING_ANIMATION });
  try {
    yield put({ type: actions.APP_FETCH_SUCCEEDED });
    yield put({ type: actions.APP_CHANGE_LANGUAGE_REQUESTED, payload: { language: 'fr' } });
  } catch (e) {
    yield put({ type: actions.APP_FETCH_FAILED, message: e.message });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
  }
  yield put({ type: actions.STOP_LOADING_ANIMATION });
}

function* changeLanguage(action) {
  try {
    yield put({ type: actions.APP_CHANGE_LANGUAGE_SUCCEEDED, language: action.payload.language });
    yield put(updateIntl({
      locale: action.payload.language,
      messages: locales[action.payload.language],
    }));
  } catch (e) {
    yield put({ type: actions.APP_CHANGE_LANGUAGE_FAILED, message: e.message });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
  }
}

function* watchLoadApp() {
  yield takeLatest(actions.APP_FETCH_REQUESTED, loadApp);
}

function* watchChangeAppLanguage() {
  yield takeLatest(actions.APP_CHANGE_LANGUAGE_REQUESTED, changeLanguage);
}

export default function* watchedAppSagas() {
  yield all([
    watchLoadApp(),
    watchChangeAppLanguage(),
  ]);
}
