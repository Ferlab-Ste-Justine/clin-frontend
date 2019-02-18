import { produce } from 'immer'
import * as actions from '../actions/type'

const initialState = {
    showLoadingAnimation: true,
    lastError: null,
};

const appReducer = (state = initialState, action) => produce(state, draft => {
    switch (action.type) {

        case actions.APP_ERROR:
            draft.lastError = action.payload;
            break;

        case actions.START_LOADING_ANIMATION:
            draft.showLoadingAnimation = true;
            break;

        case actions.STOP_LOADING_ANIMATION:
            draft.showLoadingAnimation = false;
            break;

        //case actions.APP_FETCH_REQUESTED:
        //case actions.APP_FETCH_SUCCEEDED:
        //case actions.APP_FETCH_FAILED:
        default:
            break;
    }
});

export default appReducer;