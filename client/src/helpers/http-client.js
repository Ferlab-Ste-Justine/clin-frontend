import Axios from 'axios';
import { RptManager } from './keycloak-api/manager';

const secureClinAxios = Axios.create({
  timeout: 15000,
  // withCredentials: true
});
secureClinAxios.defaults.crossdomain = true;
secureClinAxios.interceptors.request.use(async (config) => {
  const rpt = await RptManager.readRpt();
  config.headers.Authorization = `Bearer ${rpt.accessToken}`;

  // config.headers['Accept-Language'] = 'fr-CA'
  return config;
});

export default {
  secureClinAxios,
};
