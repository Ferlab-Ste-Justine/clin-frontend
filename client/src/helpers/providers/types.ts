export type ParsedPatientData = {
  id: string;
  status: string;
  lastName: string;
  firstName: string;
  ramq: string;
  mrn: string;
  organization: string;
  gender: string;
  birthDate: string;
  ethnicity: string;
  bloodRelationship: string;
  familyId: string;
  familyType: string;
  proband: string;
};

export type PractitionerData = {
  name: string;
  hospital: string;
  phone: string;
  email: string;
};

export type Prescription = {
  date: string;
  requester?: PractitionerData;
  performer?: PractitionerData;
  test: string;
  status: string;
};

export type PositionType = "proband" | "parent";
