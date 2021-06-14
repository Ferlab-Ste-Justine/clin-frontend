import capitalize from 'lodash/capitalize';
import get from 'lodash/get';
import moment from 'moment';
import { isValidRamq } from './api/PatientChecker';
import { Extension, Patient } from './types';

const EXTENSION_GROUP_MEMBER_STATUS = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/group-member-status';

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

  const yearValue = ramq.slice(4, 6);
  const monthValue = Number.parseInt(ramq.slice(6, 8), 10);
  const dayValue = Number.parseInt(ramq.slice(8, 10), 10);

  if (monthValue < 0 || (monthValue > 12 && monthValue < 51) || monthValue > 63) {
    return null;
  }

  const isFemale = monthValue >= 51;
  const birthDateYearPrefix = moment().year() > Number.parseInt(`${20}${yearValue}`, 10) ? '20' : '19';
  const birthDateString = `${birthDateYearPrefix}${yearValue}/${isFemale ? monthValue - 50 : monthValue}/${dayValue} 00:00`;
  const birthDate = moment(birthDateString, 'YYYY/M/D').toDate();

  return {
    startFirstname: ramq.slice(3, 4),
    startLastname: capitalize(ramq.slice(0, 3)),
    sex: isFemale ? 'female' : 'male',
    birthDate: birthDate <= moment().toDate() ? birthDate : undefined,
  };
}

export type GroupMemberStatus = 'Affected' | 'Unaffected' | 'Unknown';
export type GroupMemberStatusCode = 'AFF' | 'UNF' | 'UNK';

export const groupStatusObject = (code: GroupMemberStatusCode, display: GroupMemberStatus): Extension => ({
  url: EXTENSION_GROUP_MEMBER_STATUS,
  valueCoding: {
    code,
    display,
    system: 'http://fhir.cqgc.ferlab.bio/ValueSet/group-member-status',
  },
});

export const generateGroupStatus = (status: GroupMemberStatusCode): Extension => {
  switch (status) {
    case 'AFF':
      return groupStatusObject(status, 'Affected');
    case 'UNF':
      return groupStatusObject(status, 'Unaffected');
    case 'UNK':
      return groupStatusObject(status, 'Unknown');
    default:
      throw new Error(`Unknown group member status [${status}]`);
  }
};
