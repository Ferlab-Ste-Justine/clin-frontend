import { produce } from 'immer'
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-ca';
import fr_FR from 'antd/lib/locale-provider/fr_FR';
import en_US from 'antd/lib/locale-provider/en_US';

import * as actions from '../actions/type'

const initialState = {
    showLoadingAnimation: true,
    lastError: null,
    locale: {
        lang: null,
        antd: null
    }
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

        case actions.APP_CHANGE_LANGUAGE_REQUESTED:
            if (action.payload.language === 'fr') {
                draft.locale.lang = action.payload.language;
                draft.locale.antd = fr_FR;
                moment.locale(action.payload.language);
            } else if (action.payload.language === 'en') {
                draft.locale.lang = action.payload.language;
                draft.locale.antd = en_US;
                moment.locale(`${action.payload.language}-ca`);
            }
            break;

        default:
            break;
    }
});

export default appReducer;