import * as actions from './type'

export const fetchUser = (uid) => ({
    type: actions.USER_FETCH_REQUESTED,
    payload: uid
});
