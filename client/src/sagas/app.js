import {
  all, put, takeLatest,
} from 'redux-saga/effects';
import intl from 'react-intl-universal';
import { message } from 'antd';

import * as actions from '../actions/type';
import { error } from '../actions/app';
import locales from '../locales';

function* loadApp() {
  try {
    yield put({ type: actions.APP_FETCH_SUCCEEDED });
    yield put({ type: actions.APP_CHANGE_LANGUAGE_REQUESTED, payload: { language: 'fr' } });
  } catch (e) {
    yield put({ type: actions.APP_FETCH_FAILED, message: e.message });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
  }
}

function* changeLanguage(action) {
  try {
    yield intl.init({
      currentLocale: action.payload.language,
      locales,
    });
    yield put({ type: actions.APP_CHANGE_LANGUAGE_SUCCEEDED, language: action.payload.language });
  } catch (e) {
    yield put({ type: actions.APP_CHANGE_LANGUAGE_FAILED, message: e.message });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
  }
}

function showNotifications(action) {
  try {
    if (!window.agent) {
      const content = intl.get(action.payload.message);
      message[action.payload.type](content);
    } else {
      switch (action.payload.type) {
        default:
        case 'success':
          window.agent.play('Wave');
          break;
        case 'error':
          window.agent.play('Hearing_1');
          break;
        case 'warn':
        case 'warning':
          window.agent.play('GetAttention');
          break;
      }
    }
  } catch (e) {} // eslint-disable-line no-empty
}

function* watchLoadApp() {
  yield takeLatest(actions.APP_FETCH_REQUESTED, loadApp);
}

function* watchChangeAppLanguage() {
  yield takeLatest(actions.APP_CHANGE_LANGUAGE_REQUESTED, changeLanguage);
}

function* watchAppNotifications() {
  yield takeLatest(actions.NOTIFICATION, showNotifications);
}

export default function* watchedAppSagas() {
  yield all([
    watchLoadApp(),
    watchChangeAppLanguage(),
    watchAppNotifications(),
  ]);
}
