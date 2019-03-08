// https://github.com/axios/axios

import axios from 'axios';

const auth = () => ({ });
const invalidateAuth = () => ({ });
const recoverAuth = () => ({ });

/*
const data = { 'bar': 123 };
const options = {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  data: qs.stringify(data),
  url,
};
axios(options);
 */

export default {
  auth,
  invalidateAuth,
  recoverAuth,
};
