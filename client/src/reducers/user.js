import produce from 'immer'
import * as actions from '../actions/type'

const initialState = {
    data: {},
};

const userReducer = (state = initialState, action) => produce(state, draft => {
    switch (action.type) {

        case actions.USER_FETCH_REQUESTED:
            break;

        case actions.USER_FETCH_SUCCEEDED:
            break;

        case actions.USER_FETCH_FAILED:
            break;

        default:
            break;
    }
});

export default userReducer;