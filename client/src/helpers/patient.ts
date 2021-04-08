import get from 'lodash/get';
import api from './api';
import { Identifier } from './fhir/types';

export const findIdentifierByCode = (identifier: Identifier[], code: string) => identifier
  .find((id) => get(id, 'type.coding[0].code') === code);

export const isMrnUnique = async (mrnFile?: string, organization?: string, currentPatientId?: string) => {
  if (!mrnFile || !organization) {
    return true;
  }
  const response: any = await api.getPatientByIdentifier(mrnFile, organization);
  const identifiers = get(response, 'payload.data.entry[0].resource.identifier', []);
  const patientIds: string[] = get(response, 'payload.data.entry', []).map((entry: any) => entry.resource.id);
  const isUnique = identifiers.length <= 0 || (patientIds.includes(currentPatientId || ''));
  return isUnique;
};
