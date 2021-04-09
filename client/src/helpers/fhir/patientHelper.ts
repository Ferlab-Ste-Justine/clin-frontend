import capitalize from 'lodash/capitalize';
import get from 'lodash/get';
import moment from 'moment';
import { isValidRamq } from './api/PatientChecker';
import { Patient } from './types';

export function getRAMQValue(patient: Patient): string | undefined {
  return patient.identifier.find((id) => get(id, 'type.coding[0].code', '') === 'JHN')?.value;
}

export function formatRamq(value: string): string {
  const newValue = value.toUpperCase();
  return newValue
    .replace(/\s/g, '')
    .split('')
    .reduce((acc, char, index) => ((char !== ' ' && [3, 7]
      .includes(index)) ? `${acc}${char} ` : `${acc}${char}`), '').trimEnd();
}

export type RamqDetails = {
  startFirstname?: string
  startLastname?: string
  sex?: 'male' | 'female'
  birthDate?: Date
}

export function getDetailsFromRamq(ramq: string): RamqDetails | null {
  if (!isValidRamq(ramq)) {
    return null;
  }

  const yearValue = Number.parseInt(ramq.slice(4, 6), 10);
  const monthValue = Number.parseInt(ramq.slice(6, 8), 10);
  const dayValue = Number.parseInt(ramq.slice(8, 10), 10);

  if (monthValue < 0 || (monthValue > 12 && monthValue < 51) || monthValue > 63) {
    return null;
  }

  const isFemale = monthValue >= 51;
  return {
    startFirstname: ramq.slice(3, 4),
    startLastname: capitalize(ramq.slice(0, 3)),
    sex: isFemale ? 'female' : 'male',
    birthDate: moment(`${yearValue}/${isFemale ? monthValue - 50 : monthValue}/${dayValue} 00:00`, 'YY/M/D').toDate(),
  };
}
