export type ResourceType = "Practitioner" | 
                            "Patient" | 
                            "Observation" | 
                            "ClinicalImpression" | 
                            "FamilyMemberHistory" | 
                            "ServiceRequest" | 
                            "Organization" | 
                            "PractitionerRole";

export interface Meta {
    profile: string[];
}

export interface Coding {
    system?: string;
    code: string;
    display: string;
}

export interface CodeableConcept {
    coding?: Coding[];
    text?: string;
}

export interface Identifier {
    use?: string;
    type: CodeableConcept;
    value: string;
}

export interface Name {
    use?: string;
    family: string;
    given: string[];
    prefix?: string[];
    suffix?: string[];
}

export interface Age {
    value: number;
    unit: string;
    system: string;
    code: string;
}

export interface Reference {
    reference: string;
}

export interface Extension {
    url: string;
    valueCoding?: Coding;
    valueReference?: Reference;
    valueBoolean?: boolean;
    valueAge?: Age;
}

export interface Investigation {
    code: CodeableConcept;
    item: Reference[];
}

export interface Note {
    text: string;
}

export interface Relationship {
    coding: Coding[];
}

export interface Category {
    text: string;
}

export interface Telecom {
    system: string;
    value: string;
    use: string;
    rank?: number;
}

export interface Interpretation {
    coding: Coding[];
    text: string;
}

export interface Patient {
    resourceType: ResourceType;
    meta: Meta;
    extension: Extension[];
    identifier: Identifier[];
    active: boolean;
    name: Name[];
    birthDate: string;
    gender: string;
    generalPractitioner: Reference[];
    managingOrganization: Reference;
}

export interface ClinicalImpression {
    resourceType: ResourceType;
    meta: Meta;
    extension: Extension[];
    status: 'in-progress' | 'completed' | 'entered-in-error';
    subject: Reference;
    date: string;
    assessor: Reference;
    investigation: Investigation[];
}

export interface FamilyMemberHistory {
    resourceType: ResourceType;
    id: string;
    meta: Meta;
    status: string;
    patient: Reference;
    relationship: Relationship;
    note: Note[];
}

export interface ServiceRequest {
    resourceType: ResourceType;
    meta: Meta;
    extension: Extension[];
    status: string;
    intent: string;
    authoredOn: string;
    category: Category[];
    priority: string;
    code: CodeableConcept;
    requester: Reference;
    subject: Reference;
}

export interface Observation {
    resourceType: ResourceType;
    id: string;
    meta: Meta;
    status: string;
    category: CodeableConcept[];
    code: CodeableConcept;
    subject: Reference;
    interpretation: Interpretation[];
    note: Note[];
    extension: Extension[];
    valueCodeableConcept?: CodeableConcept;
}