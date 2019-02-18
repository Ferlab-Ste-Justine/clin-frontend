import { call, spawn, all } from 'redux-saga/effects';

import watchLoadApp from './app'
//import watchFetchUser from './user'

export default function* rootSaga() {
    yield all([
        watchLoadApp(),
    ])
}

/*
export default function* rootSaga() {
    const sagas = [
        watchLoadApp,
        //watchFetchUser,
    ];

    yield sagas.map(saga =>
        spawn(function* () {
            while (true) {
                try {
                    yield call(saga)
                    break
                } catch (e) {
                    console.log(e)
                }
            }
        })
    );
}*/