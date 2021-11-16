import moment from 'moment';
import {
  getDetailsFromRamq,
  makeExtensionProband,
  RamqDetails,
  replaceExtensionFamilyId,
} from './patientHelper';

describe('Helper: PatientHelper', () => {
  describe(`Function: ${getDetailsFromRamq.name}`, () => {
    test('should return null from invalid ramq', () => {
      expect(getDetailsFromRamq('')).toBeNull();
      expect(getDetailsFromRamq('toto')).toBeNull();
      expect(getDetailsFromRamq('SMIM')).toBeNull();
      expect(getDetailsFromRamq('1234567890')).toBeNull();
      expect(getDetailsFromRamq('20200101SMIM')).toBeNull();
      expect(getDetailsFromRamq('SMIM20200101')).toBeNull();
      expect(getDetailsFromRamq('SMIM20990101')).toBeNull();
    });

    test('should return valid RamqDetails from valid ramq', () => {
      expect(getDetailsFromRamq('SMIM20010101')).toEqual({
        birthDate: moment('2020-01-01').toDate(),
        sex: 'male',
        startFirstname: 'M',
        startLastname: 'Smi',
      } as RamqDetails);

      expect(getDetailsFromRamq('SMIS19512301')).toEqual({
        birthDate: moment('2019-01-23').toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
    });

    test('should handle older dates', () => {
      expect(getDetailsFromRamq('SMIS75512301')).toEqual({
        birthDate: moment('1975-01-23').toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
      expect(getDetailsFromRamq('SMIS60512301')).toEqual({
        birthDate: moment('1960-01-23').toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
    });

    test('should should handle 99 years old', () => {
      const nextYear = moment().add(1, 'year');
      const expectedYear = nextYear.subtract(100, 'years');
      expect(getDetailsFromRamq(`SMIS${nextYear.format('YY')}512301`)).toEqual({
        birthDate: moment(`${expectedYear.format('YYYY')}-01-23`).toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
    });

    test('should handle 2001', () => {
      expect(getDetailsFromRamq('SMIS01512301')).toEqual({
        birthDate: moment('2001-01-23').toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
    });
  });
  describe(`Function: ${makeExtensionProband.name}`, () => {
    test('should make an extension positively proband', () => {
      const originalExtensions = [
        { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband', valueBoolean: false },
      ];
      const expectedExtensions = [
        { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband', valueBoolean: true },
      ];

      const updatedExtensionsToIsProband = makeExtensionProband(originalExtensions);
      expect(updatedExtensionsToIsProband).toEqual(expectedExtensions);
      expect(Object.is(updatedExtensionsToIsProband, originalExtensions)).toBeFalsy();
    });
  });
  describe(`Function: ${replaceExtensionFamilyId.name}`, () => {
    test('should replace the old family id in the extension with a new family id', () => {
      const originalExtensions = [
        {
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
          valueReference: { reference: 'Group/1' },
        },
      ];
      const expectedExtensions = [
        {
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
          valueReference: { reference: 'Group/2' },
        },
      ];

      const replacedExtension = replaceExtensionFamilyId(originalExtensions, '1', '2');
      expect(replacedExtension).toEqual(expectedExtensions);
      expect(Object.is(replacedExtension, originalExtensions)).toBeFalsy();
    });
  });
});
