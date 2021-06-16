import Axios from 'axios';
import keycloak from '../keycloak';
import { ApiHelper } from './api-helpers';
import { RptManager } from './keycloak-api/manager';

const secureClinAxios = Axios.create({
  timeout: 15000,
  // withCredentials: true
});
secureClinAxios.defaults.crossdomain = true;
secureClinAxios.interceptors.request.use(async (config) => {
  const rpt = await RptManager.readRpt();
  config.headers.Authorization = `Bearer ${rpt.accessToken}`;

  if (ApiHelper.requiresIdentity(config.url)) {
    config.params = {
      ...config.params,
      fhirPractitionerId: keycloak.tokenParsed.fhir_practitioner_id,
      fhirOrganizationId: keycloak.tokenParsed.fhir_organization_id,
      realm_access: keycloak.tokenParsed.realm_access,
    };
  }
  // config.headers['Accept-Language'] = 'fr-CA'
  return config;
});

export default {
  secureClinAxios,
};
