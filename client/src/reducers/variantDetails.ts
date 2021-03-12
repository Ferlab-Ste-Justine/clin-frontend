import produce from 'immer';
import get from 'lodash/get';
import * as actions from '../actions/type';

export interface DonorGP {
  id: string;
  gender: string;
  position: string;
}

type State = {
  variantID: string;
  data: any;
  donorsGP: DonorGP[]
}

export const initialVariantDetailsState = {
  variantID: null,
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const reducer = (state: Partial<State> = {}, action: Action) => produce<Partial<State>>(state, (draft) => {
  switch (action.type) {
    case actions.VARIANT_ID_SET:
      draft.variantID = action.payload;
      break;
    case actions.VARIANT_DETAILS_SUCCEEDED:
      draft.data = action.payload.data;
      draft.donorsGP = get(action.payload.donorsGP, 'payload.data.data.hits', []).map((hit: any) => ({
        id: hit._source.id,
        gender: hit._source.gender,
        position: hit._source.position,
      }));
      break;
    case actions.USER_LOGOUT_SUCCEEDED:
      break;
    default:
      break;
  }
});

export default reducer;
