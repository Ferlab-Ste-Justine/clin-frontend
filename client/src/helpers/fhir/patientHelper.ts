import get from 'lodash/get';
import { Patient } from './types';

export function getRAMQValue(patient: Patient): string | undefined {
  return patient.identifier.find((id) => get(id, 'type.coding[0].code', '') === 'JHN')?.value;
}
