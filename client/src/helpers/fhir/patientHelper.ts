import get from 'lodash/get';
import { Patient } from './types';

export function getRAMQValue(patient: Patient): string | undefined {
  return patient.identifier.find((id) => get(id, 'type.coding[0].code', '') === 'JHN')?.value;
}

export function formatRamq(value: string): string {
  const newValue = value.toUpperCase();
  return newValue
    .replaceAll(/\s/g, '')
    .split('')
    .reduce((acc, char, index) => ((char !== ' ' && [3, 7]
      .includes(index)) ? `${acc}${char} ` : `${acc}${char}`), '').trimEnd();
}
