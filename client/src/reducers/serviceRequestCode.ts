import produce from 'immer';

import { Concept } from 'store/ServiceRequestCodeTypes';

import * as actions from '../actions/type';

export type ServiceRequestCodeState = {
  concept: Concept[];
};

type Action = {
  type: keyof typeof actions;
  payload: Concept[];
};

const initialState: ServiceRequestCodeState = { concept: [] };

const reducer = (state: ServiceRequestCodeState = initialState, action: Action) =>
  produce<ServiceRequestCodeState>(state, (draft) => {
    switch (action.type) {
    case actions.SERVICE_REQUEST_CODE_REQUESTED:
      break;
    case actions.SERVICE_REQUEST_CODE_SUCCEEDED:
      draft.concept = action.payload;
      break;
    case actions.SERVICE_REQUEST_CODE_FAILED:
      break;
    }
  });

export default reducer;
