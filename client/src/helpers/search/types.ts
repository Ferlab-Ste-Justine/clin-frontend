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
