import { PatientNanuqInformation,PrescriptionData } from '../search/types';

import { generateExport } from './nanuq';
import {
  INVALID_TYPE_VALUE, VALID_VALUE_MULTIPLE_PATIENT,
VALID_VALUE_ONE_PATIENT, } from './nanuq.mocks';

describe('Helpers: Nanuq', () => {
  describe('should throw an error when', () => {
    test('it has more than 96 element', (done) => {
      try {
        generateExport(new Array<PrescriptionData>(97));
        done.fail('it should trigger an error');
      } catch (error) {
        expect(error.message).toEqual('invalid_data');
        done();
      }
    });

    test('it has a status other than approved', (done) => {
      const patient: PatientNanuqInformation[] = INVALID_TYPE_VALUE;
      try {
        generateExport(patient);
        done.fail('it should trigger an error');
      } catch (error) {
        expect(error.message).toEqual('invalid_data');
        done();
      }
    });

  /*     test('it has another test than WXS', (done) => {
      const patient: PrescriptionData[] = INVALID_TEST_VALUE;

      try {
        generateExport(patient);
        done.fail('it should trigger an error');
      } catch (error) {
        expect(error.message).toEqual('invalid_data');
        done();
      }
    }); */
  });

  describe('should generate a valid export', () => {
    test('with one patient selected', () => {
      const result = generateExport(VALID_VALUE_ONE_PATIENT);
      expect(result.patients).toEqual([{
        DDN: '03/02/2000',
        dossier_medical: '908776665654',
        family_id: '19819',
        institution: "Centre hospitalier de l'Université de Montréal",
        nom_patient: 'Legault',
        patient_id: '19818',
        position: 'Proband',
        prenom_patient: 'Suzanne',
        service_request_id: '19798',
        sexe: 'female',
        tissue_source: 'Sang',
        type_echantillon: 'ADN',
        type_specimen: 'Normal',
      }]);
    });

    test('with multiple patients selected', () => {
      const result = generateExport(VALID_VALUE_MULTIPLE_PATIENT);
      expect(result.patients).toEqual([{
        DDN: '03/02/2000',
        dossier_medical: '908776665654',
        family_id: '19819',
        institution: "Centre hospitalier de l'Université de Montréal",
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
        nom_patient: 'Smith',
        patient_id: 'PA2',
        position: 'Proband',
        prenom_patient: 'Morty',
        service_request_id: 'SR2',
        sexe: 'male',
        tissue_source: 'Sang',
        type_echantillon: 'ADN',
        type_specimen: 'Normal',
      },
      ]);
    });
  });
});
