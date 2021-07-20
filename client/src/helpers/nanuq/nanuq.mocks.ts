import { PatientNanuqInformation, PrescriptionData } from '../search/types';

export const INVALID_TYPE_VALUE: PatientNanuqInformation[] = [
  {
    type_echantillon: 'ADN',
    tissue_source: 'Sang',
    type_specimen: 'Normal',
    nom_patient: 'LEGAULT',
    prenom_patient: 'Suzanne',
    patient_id: '19818',
    service_request_id: '19798',
    dossier_medical: '908776665654',
    institution: "Centre hospitalier de l'Université de Montréal",
    DDN: '03/02/2000',
    sexe: 'female',
    family_id: '19819',
    position: 'Proband',
    isActive: false,
  },
];

export const INVALID_TEST_VALUE: PrescriptionData[] = [
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

export const VALID_VALUE_ONE_PATIENT: PatientNanuqInformation[] = [
  {
    type_echantillon: 'ADN',
    tissue_source: 'Sang',
    type_specimen: 'Normal',
    nom_patient: 'LEGAULT',
    prenom_patient: 'Suzanne',
    patient_id: '19818',
    service_request_id: '19798',
    dossier_medical: '908776665654',
    institution: "Centre hospitalier de l'Université de Montréal",
    DDN: '03/02/2000',
    sexe: 'female',
    family_id: '19819',
    position: 'Proband',
    isActive: true,
  },
];

export const VALID_VALUE_MULTIPLE_PATIENT: PatientNanuqInformation[] = [
  {
    type_echantillon: 'ADN',
    tissue_source: 'Sang',
    type_specimen: 'Normal',
    nom_patient: 'LEGAULT',
    prenom_patient: 'Suzanne',
    patient_id: '19818',
    service_request_id: '19798',
    dossier_medical: '908776665654',
    institution: "Centre hospitalier de l'Université de Montréal",
    DDN: '03/02/2000',
    sexe: 'female',
    family_id: '19819',
    position: 'Proband',
    isActive: true,
  },
  {
    type_echantillon: 'ADN',
    tissue_source: 'Sang',
    type_specimen: 'Normal',
    nom_patient: 'Smith',
    prenom_patient: 'Morty',
    patient_id: 'PA2',
    service_request_id: 'SR2',
    dossier_medical: 'MRN0001',
    institution: 'CHUSJ',
    DDN: '05/10/2006',
    sexe: 'male',
    family_id: 'FA1',
    position: 'Proband',
    isActive: true,
  }];
