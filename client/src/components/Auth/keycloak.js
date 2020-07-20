import Keycloak from 'keycloak-js';

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


export default keycloak;
