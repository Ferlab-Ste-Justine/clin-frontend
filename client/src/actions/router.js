import * as actions from './type';

const navigate = location => ({
  type: actions.ROUTER_NAVIGATION_REQUESTED,
  payload: {
    location,
  },
});

export default navigate;
