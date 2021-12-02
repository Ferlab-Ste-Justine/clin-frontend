import produce from 'immer';

import { Concept } from 'store/ServiceResquestCodeTypes';

import * as actions from '../actions/type';

export type ServiceRequestCodeState = {
  isLoading: boolean;
  concept: Concept[];
}

type Action = {
  type: keyof typeof actions;
  payload: Concept[];
};

const initialState: ServiceRequestCodeState = { concept: [], isLoading: false };

const reducer = (
  state: ServiceRequestCodeState = initialState,
  action: Action,
) => produce<ServiceRequestCodeState>(state, (draft) => {
  switch (action.type) {
  case actions.SERVICE_REQUEST_CODE_REQUESTED:
    draft.isLoading = true;
    break;

  case actions.SERVICE_REQUEST_CODE_SUCCEEDED:
    draft.isLoading = false;
    draft.concept = action.payload;
    break;
  case actions.SERVICE_REQUEST_CODE_FAILED:
    draft.isLoading = false;;
    break;
  }
});

export default reducer;
