export type PrescriptionData = {
    id: string;
    ethnicity: string;
    bloodRelationship: boolean;
    timestamp: string;
    status: string;
    test: string;
    submitted: boolean;
    authoredOn: string;
    practitioner: Practitioner;
    patientInfo: PatientInformation;
    familyInfo: FamilyGroupInfo;
    mrn: string;
}

export type PatientData = {
    id: string;
    organization: Organization;
    lastName: string;
    firstName: string;
    gender: string;
    birthDate: string;
    practitioner: Practitioner;
    mrn: string[];
    ramq: string;
    position: string;
    familyId: string;
    familyType: string;
    ethnicity: string;
    bloodRelationship: string;
    timestamp: string;
    fetus: boolean;
    requests: RequestData[];
}

export type PatientInformation = {
    id: string;
    lastName: string;
    firstName: string;
    gender: string;
    ramq: string;
    mrn: string[];
    position: string;
    fetus: boolean;
    birthDate: string;
    organization: Organization;
}

export type PatientNanuqInformation = {
    type_echantillon: string;
    tissue_source: string;
    type_specimen: string;
    nom_patient: string;
    prenom_patient: string;
    patient_id: string;
    service_request_id: string;
    dossier_medical: string;
    institution: string;
    DDN: string;
    sexe: string;
    family_id: string;
    position: string;
    isActive: boolean;
}

export type FamilyGroupInfo = {
    id: string;
    type: string;
}

export type Organization = {
    id: string;
    name: string;
}

export type Practitioner = {
    id: string;
    lastName: string;
    firstName: string;
}

export type RequestData = {
    request: string;
    status: string;
    test: string;
    submitted: boolean;
    prescription: string;
}


