import { PatientSearchHits } from '../fhir/types';

export const INVALID_TYPE_VALUE : PatientSearchHits[] = [
  {
    id: '1',
    organization: {
      id: 'Organization/CHUSJ',
      name: '',
    },
    lastName: 'Sanchez',
    firstName: 'Rick',
    gender: 'Male',
    birthDate: '2021-01-01',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Smith',
      firstName: 'Jerry',
    },
    mrn: '1324',
    ramq: '',
    position: 'Proband',
    familyId: '1',
    familyType: 'trio',
    ethnicity: '',
    bloodRelationship: '',
    timestamp: '2021-01-01T12:19:21.297388Z',
    submitted: false,
    requests: [
      {
        test: 'WXS',
        prescription: '2021-01-01',
        status: 'draft',
        request: '1',
      },
    ],
  },
];

export const INVALID_TEST_VALUE : PatientSearchHits[] = [
  {
    id: '1',
    organization: {
      id: 'Organization/CHUSJ',
      name: '',
    },
    lastName: 'Sanchez',
    firstName: 'Rick',
    gender: 'Male',
    birthDate: '2021-01-01',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Smith',
      firstName: 'Jerry',
    },
    mrn: '1324',
    ramq: '',
    position: 'Proband',
    familyId: '1',
    familyType: 'trio',
    ethnicity: '',
    bloodRelationship: '',
    timestamp: '2021-01-01T12:19:21.297388Z',
    submitted: false,
    requests: [
      {
        status: 'draft',
        test: 'NOT_WXS',
        prescription: '2021-01-01',
        request: '1',

      },
    ],
  },
];

export const VALID_VALUE_ONE_PATIENT : PatientSearchHits[] = [
  {
    id: 'PA1',
    organization: {
      id: 'Organization/CHUSJ',
      name: '',
    },
    lastName: 'Sanchez',
    firstName: 'Rick',
    gender: 'Male',
    birthDate: '2021-01-01',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Smith',
      firstName: 'Jerry',
    },
    mrn: '1234',
    ramq: '',
    position: 'Proband',
    familyId: 'FA1',
    familyType: 'trio',
    ethnicity: '',
    bloodRelationship: '',
    timestamp: '2021-01-01T12:19:21.297388Z',
    submitted: false,
    requests: [
      {
        request: 'SR1',
        status: 'active',
        test: 'WXS',
        prescription: '2021-01-01',

      },
    ],
  },
];

export const VALID_VALUE_MULTIPLE_PATIENT : PatientSearchHits[] = [
  {
    id: 'PA1',
    organization: {
      id: 'Organization/CHUSJ',
      name: '',
    },
    lastName: 'Sanchez',
    firstName: 'Rick',
    gender: 'Male',
    birthDate: '2021-01-01',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Smith',
      firstName: 'Jerry',
    },
    mrn: '1234',
    ramq: '',
    position: 'Proband',
    familyId: 'FA1',
    familyType: 'trio',
    ethnicity: '',
    bloodRelationship: '',
    timestamp: '2021-01-01T12:19:21.297388Z',
    submitted: false,
    requests: [
      {
        test: 'WXS',
        prescription: '2021-01-01',
        status: 'active',
        request: 'SR1',

      },
    ],
  },
  {
    id: 'PA2',
    organization: {
      id: 'Organization/CHUSJ',
      name: '',
    },
    lastName: 'Smith',
    firstName: 'Morty',
    gender: 'Male',
    birthDate: '2006-10-05',
    practitioner: {
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Smith',
      firstName: 'Jerry',
    },
    mrn: '4321',
    ramq: '',
    position: 'Proband',
    familyId: 'FA1',
    familyType: 'trio',
    ethnicity: '',
    bloodRelationship: '',
    timestamp: '2021-01-01T12:19:21.297388Z',
    submitted: false,
    requests: [
      {
        test: 'WXS',
        prescription: '2021-01-01',
        status: 'active',
        request: 'SR2',

      },
    ],
  }];
