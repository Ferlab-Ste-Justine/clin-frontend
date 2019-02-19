import { produce } from 'immer'

const initialState = {
    data: {}
};

const userReducer = (state = initialState, action) => produce(state, draft => {
    switch (action.type) {

        default:
            break;
    }
});

export default userReducer;