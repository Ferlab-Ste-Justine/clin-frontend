import { PatientNanuqInformation, PrescriptionData } from '../search/types';

export const INVALID_TYPE_VALUE: PatientNanuqInformation[] = [
  {
    DDN: '03/02/2000',
    dossier_medical: '908776665654',
    family_id: '19819',
    institution: "Centre hospitalier de l'Université de Montréal",
    isActive: false,
    nom_patient: 'LEGAULT',
    patient_id: '19818',
    position: 'Proband',
    prenom_patient: 'Suzanne',
    service_request_id: '19798',
    sexe: 'female',
    tissue_source: 'Sang',
    type_echantillon: 'ADN',
    type_specimen: 'Normal',
  },
];

export const INVALID_TEST_VALUE: PrescriptionData[] = [
  {
    authoredOn: '',
    bloodRelationship: false,
    ethnicity: '',
    familyInfo: {
      id: '1',
      type: 'trio',
    },
    id: '1',
    mrn: 'MRN0001',
    patientInfo: {
      birthDate: '2021-01-01',
      fetus: false,
      firstName: 'Rick',
      gender: 'Male',
      id: '1',
      lastName: 'Sanchez',
      mrn: ['1324'],
      organization: {
        id: 'Organization/CHUSJ',
        name: '',
      },
      position: 'Proband',
      ramq: '',
    },
    practitioner: {
      firstName: 'Jerry',
      id: 'PractitionerRole/PROLE-s0me-id',
      lastName: 'Smith',
    },
    status: 'active',
    submitted: false,
    test: 'NOT_WXS',
    timestamp: '2021-01-01T12:19:21.297388Z',
  },
];

export const VALID_VALUE_ONE_PATIENT: PatientNanuqInformation[] = [
  {
    DDN: '03/02/2000',
    dossier_medical: '908776665654',
    family_id: '19819',
    institution: "Centre hospitalier de l'Université de Montréal",
    isActive: true,
    nom_patient: 'Legault',
    patient_id: '19818',
    position: 'Proband',
    prenom_patient: 'Suzanne',
    service_request_id: '19798',
    sexe: 'female',
    tissue_source: 'Sang',
    type_echantillon: 'ADN',
    type_specimen: 'Normal',
  },
];

export const VALID_VALUE_MULTIPLE_PATIENT: PatientNanuqInformation[] = [
  {
    DDN: '03/02/2000',
    dossier_medical: '908776665654',
    family_id: '19819',
    institution: "Centre hospitalier de l'Université de Montréal",
    isActive: true,
    nom_patient: 'Legault',
    patient_id: '19818',
    position: 'Proband',
    prenom_patient: 'Suzanne',
    service_request_id: '19798',
    sexe: 'female',
    tissue_source: 'Sang',
    type_echantillon: 'ADN',
    type_specimen: 'Normal',
  },
  {
    DDN: '05/10/2006',
    dossier_medical: 'MRN0001',
    family_id: 'FA1',
    institution: 'CHUSJ',
    isActive: true,
    nom_patient: 'Smith',
    patient_id: 'PA2',
    position: 'Proband',
    prenom_patient: 'Morty',
    service_request_id: 'SR2',
    sexe: 'male',
    tissue_source: 'Sang',
    type_echantillon: 'ADN',
    type_specimen: 'Normal',
  }];
