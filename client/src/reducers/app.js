/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { message } from 'antd';
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-ca';
import * as frFr from 'antd/lib/locale-provider/fr_FR'; // eslint-ignore-line camelcase
import * as enUS from 'antd/lib/locale-provider/en_US'; // eslint-ignore-line camelcase
import * as actions from '../actions/type';


export const initialAppState = {
  showLoadingAnimation: false,
  locale: {
    lang: null,
    antd: null,
  },
};

// @TODO
export const appShape = {
  showLoadingAnimation: PropTypes.bool.isRequired,
  locale: PropTypes.shape({
    lang: PropTypes.string,
    antd: PropTypes.shape({}),
  }).isRequired,
};

const appReducer = (state = Object.assign({}, initialAppState), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.SHOW_NOTIFICATION:
      if (!window.agent) {
        message[action.payload.type](action.payload.message);
      } else {
        switch (action.payload.type) {
          default:
          case 'success':
            window.agent.play('Wave');
            break;
          case 'error':
            window.agent.play('Hearing_1');
            break;
          case 'warn':
          case 'warning':
            window.agent.play('GetAttention');
            break;
        }
      }
      break;

    case actions.START_LOADING_ANIMATION:
      draft.showLoadingAnimation = true;
      break;

    case actions.STOP_LOADING_ANIMATION:
      draft.showLoadingAnimation = false;
      if (window.agent) {
        const agentIdle = ['IdleScratch', 'IdleStretch', 'IdleTailWagA', 'IdleTailWagB', 'IdleTailWagC', 'IdleTailWagD', 'IdleTwitch', 'IdleYawn', 'IdleButterFly', 'IdleCleaning', 'IdleLegLick', 'GetArtsy'];
        window.agent.play(agentIdle[Math.floor((Math.random() * agentIdle.length))]);
      }
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
