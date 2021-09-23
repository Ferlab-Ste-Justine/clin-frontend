import get from 'lodash/get';

import { Extension } from './fhir/types';
import api from './api';

const FAMILY_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id';

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

export const getFamilyMembersFromPatientDataResponse = (patientDataResponse: any): any[] => {
  const extensions = get(patientDataResponse, 'payload.data.entry[0].resource.entry[0].resource.extension', []);
  const familyExt = extensions.find((ext: Extension) => ext.url === FAMILY_EXT_URL);
  const familyId = get(familyExt, 'valueReference.reference', '').split('/')[1];
  const groupIndex = get(patientDataResponse, 'payload.data.entry[1].resource.entry', [])
    .findIndex((entry: any) => entry.fullUrl.includes(familyId));

  return get(patientDataResponse, `payload.data.entry[1].resource.entry[${groupIndex}].resource.member`, []);
}
