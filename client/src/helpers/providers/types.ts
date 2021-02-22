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
  performer?: PractitionerData;
  test: string;
  status: PrescriptionStatus;
  note?: string;
  clinicalImpressionRef: string;
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
  note: string;
};

export type ConsultationSummary = {
  practitioner: PractitionerData;
  cgh: string;
  summary: string;
  hypothesis: string;
};

export type Mrn = {
  number: string;
  hospital: string;
}

export type PositionType = 'proband' | 'parent';
export type PrescriptionStatus = 'draft' | 'on-hold' | 'revoked' | 'completed' | 'incomplete' | 'active'
