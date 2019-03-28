import { all } from 'redux-saga/effects';

import appSagas from './app';
import userSagas from './user';


export default function* rootSaga() {
  yield all([
    appSagas.loadApplicationSaga(),
    appSagas.changeLanguageSaga(),
    userSagas.userLoginSaga(),
    userSagas.userLogoutSaga(),
  ]);
}

/*
const makeRestartable = (saga) => {
    return function* () {
        yield spawn(function* () {
            while (true) {
                try {
                    yield call(saga);
                    console.error('Unexpected rootSaga termination.', saga);
                } catch (e) {
                    console.error('Saga error, the saga will be restarted', e);
                }
                //yield delay(1);
            }
        })
    };
};

const rootSagas = [
    appSagas.loadApplicationSaga,
    appSagas.changeLanguageSaga,
].map(makeRestartable);

export default function* rootSaga() {
    yield rootSagas.map(saga => call(saga));
}
*/
