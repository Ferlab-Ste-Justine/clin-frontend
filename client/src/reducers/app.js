/* eslint-disable camelcase, no-param-reassign */
import 'moment/locale/fr';
import 'moment/locale/en-ca';

import enUS from 'antd/lib/locale/en_US';
import frFr from 'antd/lib/locale/fr_FR';
import { LOCATION_CHANGE } from 'connected-react-router';
import { produce } from 'immer';
import moment from 'moment';
import PropTypes from 'prop-types';

import * as actions from '../actions/type';

export const initialAppState = {
  locale: {
    antd: null,
    lang: null,
  },
  loginMessage: '',
  referrer: null,
  showLoadingAnimation: false,
  showSubloadingAnimation: false,
};

// @TODO
export const appShape = {
  locale: PropTypes.shape({
    antd: PropTypes.shape({}),
    lang: PropTypes.string,
  }).isRequired,
  loginMessage: PropTypes.string,
  referrer: PropTypes.object,
  showLoadingAnimation: PropTypes.bool.isRequired,
  showSubloadingAnimation: PropTypes.bool.isRequired,
};

const appReducer = (state = ({ ...initialAppState }), action) => produce(state, (draft) => {
  switch (action.type) {
  case actions.APP_FETCH_REQUESTED:
  case actions.USER_LOGOUT_REQUESTED:
  case actions.ROUTER_NAVIGATION_REQUESTED:
  case actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED:
  case actions.NAVIGATION_PATIENT_SCREEN_REQUESTED:
  case actions.NAVIGATION_SUBMISSION_SCREEN_REQUESTED:
  case actions.APP_CHANGE_LANGUAGE_SUCCEEDED:
  case actions.APP_FETCH_SUCCEEDED:
  case actions.APP_FETCH_FAILED:
  case actions.APP_CHANGE_LANGUAGE_FAILED:
  case actions.USER_LOGOUT_SUCCEEDED:
  case actions.USER_LOGOUT_FAILED:
  case actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED:
  case actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED:
  case actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED:
  case actions.NAVIGATION_PATIENT_SCREEN_FAILED:
    draft.showLoadingAnimation = false;
    if (window.agent) {
      const agentIdle = [
        'IdleScratch', 'IdleStretch', 'IdleTailWagA',
        'IdleTailWagB', 'IdleTailWagC', 'IdleTailWagD',
        'IdleTwitch', 'IdleYawn', 'IdleButterFly',
        'IdleCleaning', 'IdleLegLick', 'GetArtsy',
      ];
      window.agent.play(agentIdle[Math.floor((Math.random() * agentIdle.length))]);
    }
    break;
  case actions.NAVIGATION_SUBMISSION_SCREEN_SUCCEEDED:
    break;
  case actions.NAVIGATION_SUBMISSION_SCREEN_FAILED:
    break;
  case actions.PATIENT_SEARCH_REQUESTED:
  case actions.PATIENT_FETCH_REQUESTED:
    draft.showSubloadingAnimation = true;
    break;

  case actions.STOP_SUBLOADING_ANIMATION:
  case actions.PATIENT_FETCH_SUCCEEDED:
  case actions.PATIENT_FETCH_FAILED:
    draft.showSubloadingAnimation = false;
    break;

  case actions.APP_CHANGE_LANGUAGE_REQUESTED:
    draft.showLoadingAnimation = true;
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

  case LOCATION_CHANGE:
    if (!state.referrer) {
      draft.referrer = action.payload;
    }
    break;
  default:
    break;
  }
});

export default appReducer;
