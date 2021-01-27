import { PatientSearchHits } from '../fhir/types';
import { generateExport } from './nanuq';
import {
  INVALID_TYPE_VALUE, INVALID_TEST_VALUE, VALID_VALUE_ONE_PATIENT, VALID_VALUE_MULTIPLE_PATIENT,
} from './nanuq.mocks';

describe('Helpers: Nanuq', () => {
  describe('should throw an error when', () => {
    test('it has more than 96 element', (done) => {
      try {
        generateExport(new Array<PatientSearchHits>(97));
        done.fail('it should trigger an error');
      } catch (error) {
        expect(error.message).toEqual('invalid_data');
        done();
      }
    });

    test('it has a status other than approved', (done) => {
      const patient: PatientSearchHits[] = INVALID_TYPE_VALUE;

      try {
        generateExport(patient);
        done.fail('it should trigger an error');
      } catch (error) {
        expect(error.message).toEqual('invalid_data');
        done();
      }
    });

    test('it has another test than WXS', (done) => {
      const patient: PatientSearchHits[] = INVALID_TEST_VALUE;

      try {
        generateExport(patient);
        done.fail('it should trigger an error');
      } catch (error) {
        expect(error.message).toEqual('invalid_data');
        done();
      }
    });
  });

  describe('should generate a valid export', () => {
    test('with one patient selected', () => {
      const result = generateExport(VALID_VALUE_ONE_PATIENT);
      expect(result.patients).toEqual([{
        type_echantillon: 'ADN',
        tissue_source: 'Sang',
        type_specimen: 'Normal',
        nom_patient: 'Sanchez',
        prenom_patient: 'Rick',
        patient_id: 'PA1',
        service_request_id: 'SR1',
        dossier_medical: '1234',
        institution: 'CHUSJ',
        DDN: '01/01/2021',
        sexe: 'masculin',
        famille_id: 'FA1',
        position: 'Proband',
      }]);
    });

    test('with multiple patients selected', () => {
      const result = generateExport(VALID_VALUE_MULTIPLE_PATIENT);
      expect(result.patients).toEqual([{
        type_echantillon: 'ADN',
        tissue_source: 'Sang',
        type_specimen: 'Normal',
        nom_patient: 'Sanchez',
        prenom_patient: 'Rick',
        patient_id: 'PA1',
        service_request_id: 'SR1',
        dossier_medical: '1234',
        institution: 'CHUSJ',
        DDN: '01/01/2021',
        sexe: 'masculin',
        famille_id: 'FA1',
        position: 'Proband',
      },
      {
        type_echantillon: 'ADN',
        tissue_source: 'Sang',
        type_specimen: 'Normal',
        nom_patient: 'Smith',
        prenom_patient: 'Morty',
        patient_id: 'PA2',
        service_request_id: 'SR2',
        dossier_medical: '4321',
        institution: 'CHUSJ',
        DDN: '05/10/2006',
        sexe: 'masculin',
        famille_id: 'FA1',
        position: 'Proband',
      },
      ]);
    });
  });
});
