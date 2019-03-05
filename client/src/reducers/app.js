/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-ca';
import * as frFr from 'antd/lib/locale-provider/fr_FR'; // eslint-ignore-line camelcase
import * as enUS from 'antd/lib/locale-provider/en_US'; // eslint-ignore-line camelcase

import * as actions from '../actions/type';

export const initialAppState = {
  showLoadingAnimation: true,
  lastError: null,
  locale: {
    lang: null,
    antd: null,
  },
};

export const appShapeShape = {
  showLoadingAnimation: PropTypes.bool.isRequired,
  lastError: PropTypes.string,
  locale: PropTypes.shape({
    lang: PropTypes.string,
    antd: PropTypes.shape({}),
  }).isRequired,
};

const appReducer = (state = initialAppState, action) => produce(state, (draft) => {
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
        draft.locale.antd = frFr;
        moment.locale(action.payload.language);
      } else if (action.payload.language === 'en') {
        draft.locale.lang = action.payload.language;
        draft.locale.antd = enUS;
        moment.locale(`${action.payload.language}-ca`);
      }
      break;

    default:
      break;
  }
});

export default appReducer;
