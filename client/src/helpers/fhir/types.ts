export type ResourceType =
  | 'Practitioner'
  | 'Patient'
  | 'Observation'
  | 'ClinicalImpression'
  | 'FamilyMemberHistory'
  | 'ServiceRequest'
  | 'Organization'
  | 'PractitionerRole'
  | 'Group'
  | 'Bundle';

export type FhirResource =
  | Practitioner
  | Patient
  | Observation
  | ClinicalImpression
  | FamilyMemberHistory
  | ServiceRequest
  | Organization
  | PractitionerRole
  | FamilyGroup
  | Bundle;

export type BundleMethod = 'PUT' | 'GET' | 'POST';

export interface BundleEntry {
  request: {
    method: BundleMethod,
    url: string,
  };
  fullUrl?: string;
  resource?: FhirResource;
}

export interface Bundle {
  resourceType: ResourceType;
  id?: string;
  type: string;
  entry: BundleEntry[];
}

export interface Meta {
  profile: string[];
  lastUpdated?: string;
}

export interface Coding {
  system?: string;
  code: string;
  display?: string;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Identifier {
  use?: string;
  type: CodeableConcept;
  value: string;
  assigner?: Reference;
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
  valueCodeableConcept?: CodeableConcept;
  extension?: Extension[];

  [key: string]: any;
}

export interface Investigation {
  code: CodeableConcept;
  item: Reference[];
}

export interface Note {
  text: string;
  time?: string;
  authorReference?: Reference;
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
  id?: string;
  resourceType: ResourceType;
  meta: Meta;
  extension: Extension[];
  identifier: Identifier[];
  active: boolean;
  name: Name[];
  birthDate?: string;
  gender: string;
  generalPractitioner: Reference[];
  managingOrganization: Reference;
}

export interface ClinicalImpression {
  id?: string;
  resourceType: ResourceType;
  meta: Meta;
  extension: Extension[];
  status: 'in-progress' | 'completed' | 'entered-in-error';
  subject: Reference;
  date: string;
  assessor?: Reference;
  investigation: Investigation[];
}

export interface FamilyMemberHistory {
  id?: string;
  resourceType: ResourceType;
  meta: Meta;
  status: string;
  patient: Reference;
  relationship: CodeableConcept;
  note?: Note[];
}

export interface ServiceRequest {
  id?: string;
  resourceType: ResourceType;
  meta: Meta;
  extension: Extension[];
  status: string;
  intent: string;
  authoredOn: string;
  identifier: Identifier[];
  category: Category[];
  priority: string;
  code?: CodeableConcept;
  requester?: Reference;
  performer?: Reference[];
  subject: Reference;
  note?: Note[];
}

export interface Observation {
  id?: string;
  resourceType: ResourceType;
  meta: Meta;
  status: string;
  category: CodeableConcept[];
  code: CodeableConcept;
  subject: Reference;
  interpretation?: Interpretation[];
  note?: Note[];
  extension?: Extension[];
  valueCodeableConcept?: CodeableConcept;
  valueBoolean?: boolean;
}

export type FamilyGroupType = 'person' | 'animal' | 'practitioner' | 'device' | 'medication' | 'substance';

export interface BackboneElement {
  entity: Reference;
}

export interface FamilyGroup {
  resourceType: ResourceType;
  id?: string;
  meta: Meta;
  type: FamilyGroupType;
  actual: boolean;
  extension: Extension[];
  member: BackboneElement[];
}

export interface Practitioner {
  resourceType: ResourceType;
  id: string;
  meta: Meta;
  identifier: Identifier[];
  name: Name[];
}

export interface Organization {
  resourceType: ResourceType;
  id: string;
  meta: Meta;
  name: string;
  alias: string[];
  type: CodeableConcept[];
}

export interface PractitionerRole {
  resourceType: ResourceType;
  id: string;
  meta: Meta;
  active: boolean;
  practitioner: Reference;
  organization: Reference;
  telecom: Telecom[];
  code: CodeableConcept[];
}

export interface PatientSearchHits {
  id: string;
  organization: {
    id: string
    name: string
  }
  lastName: string
  firstName: string
  gender: string
  birthDate: string,
  practitioner: {
    id: string,
    lastName: string,
    firstName: string
  },
  mrn: string,
  ramq: string,
  position: string,
  familyId: string,
  familyType: string,
  ethnicity: string,
  bloodRelationship: string,
  requests: {
    status: string;
    request: string,
    test: string,
    prescription: string,
  }[],
  timestamp: string,
  submitted: boolean,
}

export interface Member {
  extension: Extension[];
  entity: Reference;
}

export interface Group {
  id: string;
  meta: Meta;
  extension: Extension[];
  member: Member[];
}

export enum AnalysisTestCodes {
  PG= 'MM-PG',
  DYST = 'MM-DYST',
  RHAB= 'MM-RHAB',
  MYOP = 'MM-MYOP',
  MYAS = 'MM-MYAS',
  HYP = 'MM-HYP',
  DI = 'DI',
}

export const AnalysisCodeToIntlKeyText = {
  [AnalysisTestCodes.PG]: 'form.patientSubmission.clinicalInformation.analysis.options.maladiesMusculaires',
  [AnalysisTestCodes.DYST]: 'form.patientSubmission.clinicalInformation.analysis.options.dystrophiesMusculaires',
  [AnalysisTestCodes.RHAB]: 'form.patientSubmission.clinicalInformation.analysis.options.rhabdomyolyse',
  [AnalysisTestCodes.MYOP]: 'form.patientSubmission.clinicalInformation.analysis.options.myopathiesCongenitales',
  [AnalysisTestCodes.MYAS]: 'form.patientSubmission.clinicalInformation.analysis.options.myastheniasCongenitales',
  [AnalysisTestCodes.HYP]: 'form.patientSubmission.clinicalInformation.analysis.options.hyperthermieMaligne',
  [AnalysisTestCodes.DI]: 'form.patientSubmission.clinicalInformation.analysis.options.deficienceIntellectuelle',
}

export enum PrescriptionStatus {
  draft= 'draft',
  hold = 'on-hold',
  active= 'active',
  completed = 'completed',
  revoked = 'revoked',
  incomplete = 'incomplete',
}