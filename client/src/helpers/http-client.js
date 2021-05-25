import Axios from 'axios';
import keycloak from '../keycloak';
import { RptManager } from './keycloak-api/manager';

const secureClinAxios = Axios.create({
  timeout: 15000,
  // withCredentials: true
});
secureClinAxios.defaults.crossdomain = true;
secureClinAxios.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  // config.headers['Accept-Language'] = 'fr-CA'
  return config;
});

const { post } = secureClinAxios;
const { get } = secureClinAxios;
const { put } = secureClinAxios;

secureClinAxios.post = async (url, data, config = {}) => {
  if (!url.startsWith(window.CLIN.fhirBaseUrl)) {
    return post(url, data, config);
  }

  const rpt = await RptManager.readRpt();

  return post(url, data, {
    ...config,
    headers: {
      RPT: rpt.accessToken,
    },
  });
};

secureClinAxios.get = async (url, config = {}) => {
  if (!url.startsWith(window.CLIN.fhirBaseUrl)) {
    return get(url, config);
  }
  const rpt = await RptManager.readRpt();

  return get(url, {
    ...config,
    headers: {
      RPT: rpt.accessToken,
    },
  });
};

secureClinAxios.put = async (url, data, config) => {
  if (!url.startsWith(window.CLIN.fhirBaseUrl)) {
    return put(url, data, config);
  }
  const rpt = await RptManager.readRpt();

  return put(url, data, {
    ...config,
    headers: {
      RPT: rpt.accessToken,
    },
  });
};

export default {
  secureClinAxios,
};
