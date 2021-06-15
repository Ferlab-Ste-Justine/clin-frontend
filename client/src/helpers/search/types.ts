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

export type DocumentReferenceContent = {
    url: string;
    size: number;
    hash: string;
    title: string;
    format: string;
}

export type SpecimenContent = {
    external_id: string;
    organization: {
        id: string;
        alias: string[];
        name: string;
    }
}
export type DocumentReferenceResponse = {
    resource: {
        id: string;
        type: string;
        content: DocumentReferenceContent[];
        specimen: SpecimenContent[];
    }
}
export type TaskResponse = {
    id: string;
    // Resource should be renamed to serviceRequest [if possible]
    resource: {
        id: string; // Also has history
    }
    runDate: string[];
    output: DocumentReferenceResponse;
}
export type PatientResponse ={
    tasks: TaskResponse[];
}
export type FileResponse = {
    Patient: PatientResponse;
}
