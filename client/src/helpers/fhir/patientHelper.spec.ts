import moment from 'moment';
import { getDetailsFromRamq, RamqDetails } from './patientHelper';

describe('Helper: PatientHelper', () => {
  describe('Function: getDetailsFromRamq', () => {
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
        startFirstname: 'M',
        startLastname: 'Smi',
        birthDate: moment('2020-01-01').toDate(),
        sex: 'male',
      } as RamqDetails);

      expect(getDetailsFromRamq('SMIS19512301')).toEqual({
        startFirstname: 'S',
        startLastname: 'Smi',
        birthDate: moment('2019-01-23').toDate(),
        sex: 'female',
      } as RamqDetails);
    });

    test('should handle older dates', () => {
      expect(getDetailsFromRamq('SMIS75512301')).toEqual({
        startFirstname: 'S',
        startLastname: 'Smi',
        birthDate: moment('1975-01-23').toDate(),
        sex: 'female',
      } as RamqDetails);
      expect(getDetailsFromRamq('SMIS60512301')).toEqual({
        startFirstname: 'S',
        startLastname: 'Smi',
        birthDate: moment('1960-01-23').toDate(),
        sex: 'female',
      } as RamqDetails);
    });

    test('should should handle 99 years old', () => {
      const nextYear = moment().add(1, 'year');
      const expectedYear = nextYear.subtract(100, 'years');
      expect(getDetailsFromRamq(`SMIS${nextYear.format('YY')}512301`)).toEqual({
        startFirstname: 'S',
        startLastname: 'Smi',
        birthDate: moment(`${expectedYear.format('YYYY')}-01-23`).toDate(),
        sex: 'female',
      } as RamqDetails);
    });

    test('should handle 2001', () => {
      expect(getDetailsFromRamq('SMIS01512301')).toEqual({
        startFirstname: 'S',
        startLastname: 'Smi',
        birthDate: moment('2001-01-23').toDate(),
        sex: 'female',
      } as RamqDetails);
    });
  });
});
