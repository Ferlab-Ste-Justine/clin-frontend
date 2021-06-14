import { GroupMemberStatusCode } from '../fhir/patientHelper';

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

export enum FamilyMemberType {
  FATHER= 'FTH',
  MOTHER = 'MTH',
  NATURAL_MOTHER_OF_FETUS = 'NMTHF',
  BROTHER = 'BRO',
  SISTER = 'SIS',
  HALF_BROTHER = 'HBRO',
  HALF_SISTER ='HSIS',
  IDENTICAL_TWIN = 'ITWIN',
  FRATERNAL_TWIN = 'FTWIN',
  SON = 'SONC',
  DAUGHTER = 'DTH',
  MATERNAL_AUNT = 'MAUNT',
  PATERNAL_AUNT = 'PAUNT',
  MATERNAL_UNCLE = 'MUNCLE',
  PATERNAL_UNCLE = 'PUNCLE',
  MATERNAL_COUSIN = 'MCOUSN',
  PATERNAL_COUSIN = 'PCOUSN',
  MATERNAL_GRAND_FATHER = 'MGRFTH',
  PATERNAL_GRAND_FATHER = 'PGRFTH',
  MATERNAL_GRAND_MOTHER = 'MGRMTH',
  PATERNAL_GRAND_MOTHER = 'PGRMTH',
  NEPHEW = 'NEPHEW',
  NIECE = 'NIECE'
}

export type FamilyMember = {
  id: string;
  lastName: string;
  firstName: string;
  ramq?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  code: GroupMemberStatusCode
  type?: FamilyMemberType
}

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
