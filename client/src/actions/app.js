import * as actions from './type'

export const loadApp = () => ({
    type: actions.APP_FETCH_REQUESTED
});

export const catchError = (error) => ({
    type: actions.APP_ERROR,
    payload: error
});
