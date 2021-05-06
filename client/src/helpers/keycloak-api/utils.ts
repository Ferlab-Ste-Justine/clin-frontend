export const KEYCLOAK_AUTH_RESOURCE_PATIENT_VARIANTS = 'patient-variants';
export const KEYCLOAK_AUTH_RESOURCE_PATIENT_FAMILY = 'patient-family';
export const KEYCLOAK_AUTH_RESOURCE_PATIENT_FILES = 'patient-files';
export const KEYCLOAK_AUTH_RESOURCE_PATIENT_PRESCRIPTIONS = 'patient-prescriptions';
export const KEYCLOAK_AUTH_RESOURCE_PATIENT_LIST = 'patient-list';

export const KEYCLOAK_AUTH_RESOURCES = [
  KEYCLOAK_AUTH_RESOURCE_PATIENT_LIST,
  KEYCLOAK_AUTH_RESOURCE_PATIENT_PRESCRIPTIONS,
  KEYCLOAK_AUTH_RESOURCE_PATIENT_FILES,
  KEYCLOAK_AUTH_RESOURCE_PATIENT_FAMILY,
  KEYCLOAK_AUTH_RESOURCE_PATIENT_VARIANTS,
];

export const KEYCLOAK_AUTH_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:uma-ticket';
export const KEYCLOAK_AUTH_RESPONSE_MODE = 'permissions';

type Config = {
    url: string;
    authClientId: string;
  };

export const KEYCLOAK_CONFIG = JSON.parse(process.env.REACT_APP_KEYCLOAK_CONFIG) as Config;
