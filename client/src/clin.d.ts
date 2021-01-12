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
    fhirEsBundleId: string,
}

export declare global { interface Window { CLIN: ClinData } }
