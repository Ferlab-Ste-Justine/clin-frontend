import { combineReducers } from 'redux'
import { RouterState, connectRouter } from 'connected-react-router'

const rootReducer = (history) => combineReducers({
    router: connectRouter(history)
});

export default rootReducer;
