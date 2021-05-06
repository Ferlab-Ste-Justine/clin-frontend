interface ClinData {
    namespace: string,
    patientServiceApiUrl: string,
    variantServiceApiUrl: string,
    geneServiceApiUrl: string,
    metaServiceApiUrl: string,
    fhirBaseUrl: string,
    hpoBaseUrl: string,
    translate?: boolean,
    defaultUsername: string,
    defaultPassword: string,
    fhirEsPatientBundleId: string,
    fhirEsRequestBundleId: string,
    keycloakUrl: string;
    keycloakAuthClientId: string;
}

export declare global {
    interface Window { CLIN: ClinData }
    declare namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: string
            REACT_APP_TITLE: string
            REACT_APP_RELEASE_ID: string
            REACT_APP_RELEASE_NAME: string
            REACT_APP_NOSCRIPT_CONTENT: string
            REACT_APP_NAMESPACE: string
            REACT_APP_PATIENT_SERVICE_URL: string
            REACT_APP_VARIANT_SERVICE_URL: string
            REACT_APP_GENE_SERVICE_URL: string
            REACT_APP_META_SERVICE_URL: string
            REACT_APP_FHIR_SERVICE_URL: string
            REACT_APP_HPO_SERVICE_URL: string
            REACT_APP_DEFAULT_USERNAME: string
            REACT_APP_DEFAULT_PASSWORD: string
            REACT_APP_FHIR_ES_PATIENT_BUNDLE_ID: string
            REACT_APP_FHIR_ES_REQUEST_BUNDLE_ID: string
            REACT_APP_KEYCLOAK_CONFIG: string
            HTTPS: string
            REACT_APP_KEYCLOAK_URL: string
            REACT_APP_KEYCLOAK_AUTH_CLIENT_ID: string
        }
    }
}
