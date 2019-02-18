import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import appReducer from './app'
//import userReducer from './user'

const rootReducer = (history) => combineReducers({
    router: connectRouter(history),
    app: appReducer,
    //user: userReducer,
});

export default rootReducer;
