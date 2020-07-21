import Keycloak from 'keycloak-js';

const keyCloakConfig = JSON.parse(process.env.REACT_APP_KEYCLOAK_CONFIG);
const keycloak = Keycloak(keyCloakConfig);

keycloak.onTokenExpired = () => {
  keycloak.updateToken(-1)
    .then(() => {
      // set state with refreshed token
    })
    .catch(() => {
      console.log('#### KEYCLOAK.JS - onTokenExpired - refresh token expired.  Redirecting to login. ');
      // Refresh token expired.  Access token could not be renews
      keycloak.logout();
    });
};

export default keycloak;

/*
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

  console.log(`#### KEYCLOAK.JS - token : ${token}`);
  if (token) {
    config.token = token;
  }
  return config;
};
*/
