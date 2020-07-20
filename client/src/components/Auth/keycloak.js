import Keycloak from 'keycloak-js';

console.group('config');

const getKeyValueFromHash = () => {
  const hash = window.location.hash.substr(1).split('&');
  const hashValues = {};
  hash.forEach((v) => { const [key, value] = v.split('='); hashValues[`${key}`] = value; });
  return hashValues;
};

const getNonce = hashData => JSON.parse(localStorage.getItem(`kc-callback-${hashData.state}`)).nonce;

export const keycloakProviderInitConfig = () => {
  const config = {}; // { onLoad: 'login-required', checkLoginIframeInterval: 1 };
  const hashData = getKeyValueFromHash();
  const token = hashData.state ? getNonce(hashData) : null;

  if (token) {
    config.token = token;
  }
  return config;
};

const keyCloakConfig = JSON.parse(process.env.REACT_APP_KEYCLOAK_CONFIG);
const keycloak = Keycloak(keyCloakConfig);

keycloak.onReady = e => console.log('kc onInit : , e', e);
keycloak.onAuthSuccess = e => console.log('kc onInit : , e', e);
keycloak.onAuthError = e => console.log('kc onInit : , e', e);
keycloak.onAuthRefreshSuccess = e => console.log('kc onInit : , e', e);
keycloak.onAuthRefreshError = e => console.log('kc onInit : , e', e);
keycloak.onAuthLogout = e => console.log('kc onInit : , e', e);
keycloak.onTokenExpired = e => console.log('kc onInit : , e', e);

console.groupEnd();

keycloak.onTokenExpired = (e) => {
  console.log('kc tokens :', e);
  keycloak.updateToken(-1)
    .then((refreshed) => {
      if (refreshed) {
        // Token was successfully refreshed
      } else {
        // Token is still valid
      }
    })
    .catch(() => {
      // Refresh token expired.  Access token could not be renews
      keycloak.logout();
    });
};

export default keycloak;
