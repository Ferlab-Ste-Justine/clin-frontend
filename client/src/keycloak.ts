import Keycloak from 'keycloak-js';

const keyCloakConfig = JSON.parse(process.env.REACT_APP_KEYCLOAK_CONFIG!);
const keycloak = Keycloak(keyCloakConfig);

export default keycloak;
