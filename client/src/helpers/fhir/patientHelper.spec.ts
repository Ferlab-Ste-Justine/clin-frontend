import moment from 'moment';
import { getDetailsFromRamq, RamqDetails } from './patientHelper';

describe('Helper: PatientHelper', () => {
  describe.only('Function: getDetailsFromRamq', () => {
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
  });
});
