import get from 'lodash/get';

import { Extension } from './fhir/types';
import { ParsedPatientData } from './providers/types';
import api from './api';
import { FAMILY_RELATION_EXT_URL, FAMILY_EXT_URL } from '../store/urls';

export const isMrnUnique = async (
  mrnFile?: string,
  organization?: string,
  currentPatientId?: string,
) => {
  if (!mrnFile || !organization) {
    return true;
  }
  const response: any = await api.getPatientByIdentifier(mrnFile, organization);
  const identifiers = get(response, 'payload.data.entry[0].resource.identifier', []);
  const patientIds: string[] = get(response, 'payload.data.entry', []).map(
    (entry: any) => entry.resource.id,
  );
  const isUnique = identifiers.length <= 0 || patientIds.includes(currentPatientId || '');
  return isUnique;
};

export const getFamilyMembersFromPatientDataResponse = (patientDataResponse: any): any[] => {
  const extensions = get(
    patientDataResponse,
    'payload.data.entry[0].resource.entry[0].resource.extension',
    [],
  );
  const familyExt = extensions.find((ext: Extension) => ext.url === FAMILY_EXT_URL);
  const familyId = get(familyExt, 'valueReference.reference', '').split('/')[1];
  const groupIndex = get(patientDataResponse, 'payload.data.entry[1].resource.entry', []).findIndex(
    (entry: any) => entry.fullUrl.includes(familyId),
  );

  return get(
    patientDataResponse,
    `payload.data.entry[1].resource.entry[${groupIndex}].resource.member`,
    [],
  );
};

export const isParsedPatientProband = (patient: ParsedPatientData): boolean =>
  !!patient && patient.proband?.toLowerCase() === 'proband';

export const removeSpecificFamilyRelation = (
  familyRelationId: string,
  patientExtension: Extension[],
): Extension[] => {
  if (!familyRelationId || !patientExtension?.length) {
    return [];
  }
  return patientExtension.reduce<Extension[]>((accumulator, ext) => {
    if (ext.url === FAMILY_RELATION_EXT_URL) {
      const relation = ext.extension?.find((ext) => ext.url === 'subject');
      const patientIdWithPrefix = relation?.valueReference?.reference;
      if (patientIdWithPrefix && patientIdWithPrefix.includes('/' + familyRelationId)) {
        return [...accumulator];
      }
    }
    return [...accumulator, { ...ext }];
  }, []);
};
