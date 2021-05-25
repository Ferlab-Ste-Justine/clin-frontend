import { PrescriptionData } from '../search/types';

export const INVALID_TYPE_VALUE : PrescriptionData[] = [
  {
    id: '1',
    mrn: 'MRN0001',
    ethnicity: '',
    bloodRelationship: false,
    timestamp: '2021-01-01T12:19:21.297388Z',
    status: 'draft',
    test: 'WXS',
    submitted: false,
    authoredOn: '',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Smith',
      firstName: 'Jerry',
    },
    patientInfo: {
      id: '1',
      lastName: 'Sanchez',
      firstName: 'Rick',
      gender: 'Male',
      ramq: '',
      mrn: ['1324'],
      position: 'Proband',
      fetus: false,
      birthDate: '2021-01-01',
      organization: {
        id: 'Organization/CHUSJ',
        name: '',
      },
    },
    familyInfo: {
      id: '1',
      type: 'trio',
    },
  },
];

export const INVALID_TEST_VALUE : PrescriptionData[] = [
  {
    id: '1',
    mrn: 'MRN0001',
    ethnicity: '',
    bloodRelationship: false,
    timestamp: '2021-01-01T12:19:21.297388Z',
    status: 'active',
    test: 'NOT_WXS',
    submitted: false,
    authoredOn: '',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Smith',
      firstName: 'Jerry',
    },
    patientInfo: {
      id: '1',
      lastName: 'Sanchez',
      firstName: 'Rick',
      gender: 'Male',
      ramq: '',
      mrn: ['1324'],
      position: 'Proband',
      fetus: false,
      birthDate: '2021-01-01',
      organization: {
        id: 'Organization/CHUSJ',
        name: '',
      },
    },
    familyInfo: {
      id: '1',
      type: 'trio',
    },
  },
];

export const VALID_VALUE_ONE_PATIENT : PrescriptionData[] = [
  {
    id: 'SR1',
    mrn: 'MRN0001',
    ethnicity: '',
    bloodRelationship: false,
    timestamp: '2021-01-01T12:19:21.297388Z',
    status: 'active',
    test: 'NOT_WXS',
    submitted: false,
    authoredOn: '',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Sanchez',
      firstName: 'Rick',
    },
    patientInfo: {
      id: 'PA1',
      lastName: 'Sanchez',
      firstName: 'Rick',
      gender: 'Male',
      ramq: '',
      mrn: ['1324'],
      position: 'Proband',
      fetus: false,
      birthDate: '2021-01-01',
      organization: {
        id: 'Organization/CHUSJ',
        name: '',
      },
    },
    familyInfo: {
      id: 'FA1',
      type: 'trio',
    },
  },
];

export const VALID_VALUE_MULTIPLE_PATIENT : PrescriptionData[] = [
  {
    id: 'SR1',
    mrn: 'MRN0001',
    ethnicity: '',
    bloodRelationship: false,
    timestamp: '2021-01-01T12:19:21.297388Z',
    status: 'active',
    test: 'NOT_WXS',
    submitted: false,
    authoredOn: '',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Sanchez',
      firstName: 'Rick',
    },
    patientInfo: {
      id: 'PA1',
      lastName: 'Sanchez',
      firstName: 'Rick',
      gender: 'Male',
      ramq: '',
      mrn: ['1324'],
      position: 'Proband',
      fetus: false,
      birthDate: '2021-01-01',
      organization: {
        id: 'Organization/CHUSJ',
        name: '',
      },
    },
    familyInfo: {
      id: 'FA1',
      type: 'trio',
    },
  },
  {
    id: 'SR2',
    mrn: 'MRN0001',
    ethnicity: '',
    bloodRelationship: false,
    timestamp: '2021-01-01T12:19:21.297388Z',
    status: 'active',
    test: 'NOT_WXS',
    submitted: false,
    authoredOn: '',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Smith',
      firstName: 'Morty',
    },
    patientInfo: {
      id: 'PA2',
      lastName: 'Smith',
      firstName: 'Morty',
      gender: 'Male',
      ramq: '',
      mrn: ['1324'],
      position: 'Proband',
      fetus: false,
      birthDate: '2006-10-05',
      organization: {
        id: 'Organization/CHUSJ',
        name: '',
      },
    },
    familyInfo: {
      id: 'FA1',
      type: 'trio',
    },
  }];
