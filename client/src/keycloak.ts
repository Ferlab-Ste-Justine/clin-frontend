import Keycloak from 'keycloak-js';

declare global {
    interface Window { env: any; }
}

const keyCloakConfig = JSON.parse(window.env.REACT_APP_KEYCLOAK_CONFIG || process.env.REACT_APP_KEYCLOAK_CONFIG!);
const keycloak = Keycloak(keyCloakConfig);

export default keycloak;
