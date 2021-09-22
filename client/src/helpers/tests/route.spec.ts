import { Routes } from 'helpers/route';

describe('Helpers', () => {
  describe('routes url', () => {

    test('Access Denied', async () => {
      expect(Routes.AccessDenied).toEqual('/access-denied');
    });

    test('Main Page', async () => {
      expect(Routes.MainSearch).toEqual('/search');
    });

    test('Patient', async () => {
      expect(Routes.Patient).toEqual('/patient');
    });

    test('Patient Search', async () => {
      expect(Routes.PatientSearch).toEqual('/patient/search');
    });

    test('Patient Variants', async () => {
      expect(Routes.PatientVariants).toEqual('/patient/:uid/variant');
    });

    test('Submission', async () => {
      expect(Routes.Submission).toEqual('/submission');
    });

    test('Variant', async () => {
      expect(Routes.Variant).toEqual('/variantDetails');
    });

    describe('getPatientPath', () => {
      test('return url string match for router', async () => {
        expect(Routes.getPatientPath()).toEqual('/patient/:uid');
      });

      test('return url string match for specific patient', async () => {
        const patientId = 'Id2343';
        expect(Routes.getPatientPath(patientId)).toEqual(`/patient/${patientId}`);
      });

      test('return url string match for specific patient  with a specific tab', async () => {
        const patientId = 'Id2343';
        let tab = 'prescriptions';
        expect(Routes.getPatientPath(patientId, tab)).toEqual(`/patient/${patientId}/#${tab}`);
        tab = 'family';
        expect(Routes.getPatientPath(patientId, tab)).toEqual(`/patient/${patientId}/#${tab}`);
        tab = 'variant';
        expect(Routes.getPatientPath(patientId, tab)).toEqual(`/patient/${patientId}/#${tab}`);
      });
    });

    test('getVariantPath shoud return the router string or a specific uid', async () => {
      expect(Routes.getVariantPath()).toEqual('/variantDetails/:uid');
      const uid = 'id23423';
      expect(Routes.getVariantPath(uid)).toEqual(`/variantDetails/${uid}`);

    });
  });
});
