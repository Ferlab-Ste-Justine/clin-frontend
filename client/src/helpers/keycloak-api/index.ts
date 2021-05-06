import queryString from 'querystring';
import httpClient from '../http-client';
import {
  KEYCLOAK_AUTH_GRANT_TYPE, KEYCLOAK_AUTH_RESOURCES, KEYCLOAK_AUTH_RESPONSE_MODE, KEYCLOAK_CONFIG,
} from './utils';

export const userAuthPermissions = async () => {
  const data = queryString.encode({
    grant_type: KEYCLOAK_AUTH_GRANT_TYPE,
    audience: KEYCLOAK_CONFIG.authClientId,
    response_mode: KEYCLOAK_AUTH_RESPONSE_MODE,
    permission: KEYCLOAK_AUTH_RESOURCES,
  });

  try {
    const response = await httpClient.secureClinAxios.post(
      `${KEYCLOAK_CONFIG.url}realms/clin/protocol/openid-connect/token`,
      data,
    );

    return Promise.resolve(response);
  } catch (e) {
    return Promise.resolve({
      data: [],
    });
  }
};
