import * as actions from './type';

const fetchVariantDetails = (uid) => ({
  type: actions.VARIANT_DETAILS_REQUESTED,
  payload: uid,
});

export default fetchVariantDetails;
