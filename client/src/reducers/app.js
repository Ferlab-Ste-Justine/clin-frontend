/* eslint-disable camelcase, no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-ca';
import { LOCATION_CHANGE } from 'connected-react-router';

import enUS from 'antd/lib/locale/en_US';
import frFr from 'antd/lib/locale/fr_FR';
import * as actions from '../actions/type';

export const initialAppState = {
  showLoadingAnimation: false,
  showSubloadingAnimation: false,
  locale: {
    lang: null,
    antd: null,
  },
  referrer: null,
  loginMessage: '',
};

// @TODO
export const appShape = {
  showLoadingAnimation: PropTypes.bool.isRequired,
  showSubloadingAnimation: PropTypes.bool.isRequired,
  locale: PropTypes.shape({
    lang: PropTypes.string,
    antd: PropTypes.shape({}),
  }).isRequired,
  referrer: PropTypes.object,
  loginMessage: PropTypes.string,
};

const appReducer = (state = ({ ...initialAppState }), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.START_LOADING_ANIMATION:
    case actions.APP_FETCH_REQUESTED:
    case actions.USER_LOGOUT_REQUESTED:
    case actions.ROUTER_NAVIGATION_REQUESTED:
    case actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED:
    case actions.NAVIGATION_PATIENT_SCREEN_REQUESTED:
    case actions.NAVIGATION_PATIENT_VARIANT_SCREEN_REQUESTED:
      draft.showLoadingAnimation = true;
      break;
    case actions.NAVIGATION_SUBMISSION_SCREEN_REQUESTED:
    case actions.APP_CHANGE_LANGUAGE_SUCCEEDED:
    case actions.STOP_LOADING_ANIMATION:
    case actions.APP_FETCH_SUCCEEDED:
    case actions.APP_FETCH_FAILED:
    case actions.APP_CHANGE_LANGUAGE_FAILED:
    case actions.ROUTER_NAVIGATION_SUCCEEDED:
    case actions.ROUTER_NAVIGATION_FAILED:
    case actions.USER_LOGOUT_SUCCEEDED:
    case actions.USER_LOGOUT_FAILED:
    case actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED:
    case actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED:
    case actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED:
    case actions.NAVIGATION_PATIENT_SCREEN_FAILED:
    case actions.NAVIGATION_PATIENT_VARIANT_SCREEN_SUCCEEDED:
    case actions.NAVIGATION_PATIENT_VARIANT_SCREEN_FAILED:
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
    case actions.START_SUBLOADING_ANIMATION:
    case actions.PATIENT_SEARCH_REQUESTED:
    case actions.PATIENT_FETCH_REQUESTED:
    case actions.PATIENT_VARIANT_SEARCH_REQUESTED:
    case actions.PATIENT_VARIANT_COUNT_REQUESTED:
    case actions.VARIANT_SCHEMA_REQUESTED:
    case actions.CHANGE_SEARCH_TYPE_REQUESTED:
      draft.showSubloadingAnimation = true;
      break;

    case actions.STOP_SUBLOADING_ANIMATION:
    case actions.PATIENT_SEARCH_SUCCEEDED:
    case actions.PATIENT_SEARCH_FAILED:
    case actions.PATIENT_FETCH_SUCCEEDED:
    case actions.PATIENT_FETCH_FAILED:
    case actions.PATIENT_VARIANT_PAGE_READY:
    case actions.PATIENT_VARIANT_SEARCH_FAILED:
    case actions.PATIENT_VARIANT_COUNT_FAILED:
    case actions.VARIANT_SCHEMA_SUCCEEDED:
    case actions.VARIANT_SCHEMA_FAILED:
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
