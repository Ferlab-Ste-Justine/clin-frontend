import * as actions from './type'

export const loadApp = () => ({
    type: actions.APP_FETCH_REQUESTED
});

export const changeLanguage = (language) => ({
    type: actions.APP_CHANGE_LANGUAGE_REQUESTED,
    payload: {
        language: language
    }
});

export const catchError = (error) => ({
    type: actions.APP_ERROR,
    payload: error
});
