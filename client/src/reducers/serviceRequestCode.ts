import { SERVICE_REQUEST_CODE_FAILED,SERVICE_REQUEST_CODE_REQUESTED, SERVICE_REQUEST_CODE_SUCCEEDED }  from 'actions/type'
import produce from 'immer';

import { Concept } from 'store/ServiceRequestCodeTypes';

export type ServiceRequestCodeState = {
  concept: Concept[];
};

type Action = {
  type: typeof SERVICE_REQUEST_CODE_REQUESTED | typeof SERVICE_REQUEST_CODE_FAILED | typeof SERVICE_REQUEST_CODE_SUCCEEDED;
  payload: Concept[];
};

const initialState: ServiceRequestCodeState = { concept: [] };

const reducer = (state: ServiceRequestCodeState = initialState, action: Action) =>
  produce<ServiceRequestCodeState>(state, (draft) => {
    switch (action.type) {
    case SERVICE_REQUEST_CODE_REQUESTED:
      break;
    case SERVICE_REQUEST_CODE_SUCCEEDED:
      draft.concept = action.payload;
      break;
    case SERVICE_REQUEST_CODE_FAILED:
      break;
    }
  });

export default reducer;
