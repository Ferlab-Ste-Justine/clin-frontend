/* eslint-disable no-param-reassign */
import { produce } from 'immer';

export const initialUserState = {
  data: {},
};

const userReducer = (state = initialUserState, action) => produce(state, (draft) => { // eslint-disable-line no-unused-vars, max-len
  switch (action.type) {
    default:
      break;
  }
});

export default userReducer;
