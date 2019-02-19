import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { intlReducer } from 'react-intl-redux'

import appReducer from './app'
import userReducer from './user'

const rootReducer = (history) => combineReducers({
    router: connectRouter(history),
    intl: intlReducer,
    app: appReducer,
    user: userReducer,
});

export default rootReducer;
