export type ParsedPatientData = {
  id: string;
  status: string;
  lastName: string;
  firstName: string;
  ramq: string;
  mrn: Mrn[];
  organization: string;
  gender: string;
  birthDate?: string;
  ethnicity: string;
  bloodRelationship: string;
  familyId: string;
  familyType: string;
  proband: string;
  isFetus: boolean;
  familyRelation?: string;
};

export type PractitionerData = {
  lastName: string;
  firstName: string;
  formattedName: string;
  mrn: string;
  organization: string;
  phone: string;
  phoneExtension: string;
  email: string;
};

export type Prescription = {
  id?: string;
  date: string;
  requester?: PractitionerData;
  supervisor?: PractitionerData;
  performer?: PractitionerData;
  test: string;
  status: PrescriptionStatus;
  note?: string;
  clinicalImpressionRef: string;
  mrn?: string;
  organization?: string;
};

export type ClinicalObservation = {
  observed: 'NEG' | 'POS' | 'IND';
  term: string;
  ageAtOnset: string;
  note: string;
  category: string;
  id: string;
};

export type FamilyObservation = {
  id: string;
  link: string;
  code: string;
  note: string;
};

export type ConsultationSummary = {
  clinicalImpressionRef: string;
  practitioner: PractitionerData;
  cgh: string;
  summary: string;
  hypothesis: string;
  ageAtEvent: string;
};

export type Mrn = {
  number: string;
  hospital: string;
}

export type PrescriptionStatus = 'draft' | 'on-hold' | 'revoked' | 'completed' | 'incomplete' | 'active'
