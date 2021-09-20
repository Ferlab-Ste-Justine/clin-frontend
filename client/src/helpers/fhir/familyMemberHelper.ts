import { Extension, Patient } from './types';
import { getRAMQValue } from './patientHelper';
import { FamilyMember, FamilyMembersResponse, FamilyMemberType } from '../../store/FamilyMemberTypes';

const FAMILY_RELATION_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation';
const PROBAND_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband';
const FETUS_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus';

type RefToCode = {
  [index: string]: string
}

const buildPatientRefToRelationCode = (relations: Extension[]) => (relations || []).reduce<RefToCode>(
  (accumulator: RefToCode, relation: Extension) => {
    const extension = (relation?.extension || []);
    const patientReferenceWithPrefix = extension[0]?.valueReference?.reference || '';
    const patientReference = patientReferenceWithPrefix.split('/')[1];
    const relationCode = (extension[1]?.valueCodeableConcept?.coding || [])[0]?.code;
    if (patientReference && relationCode) {
      return {
        ...accumulator,
        [patientReference]: relationCode,
      };
    }
    return accumulator;
  },
  {},
);

const findBooleanValueFromExtensions = (url: string, extensions: Extension[]) => !!(extensions || [])
  .find((ext) => ext.url === url)
  ?.valueBoolean;

export const parseFamilyMember = (familyData?: FamilyMembersResponse[], patient?: Patient): FamilyMember[] => {
  if (!familyData || familyData.length === 0) {
    return [];
  }

  const relationsFromPatient = patient?.extension?.filter((ext) => ext.url === FAMILY_RELATION_EXT_URL) || [];
  const relationsForMembers = familyData.map((rawFamilyMember: FamilyMembersResponse) => {
    const mainEntry = rawFamilyMember?.entry?.resource?.entry[0];
    const extensions = mainEntry?.resource?.extension || [];
    return extensions.filter((ext) => ext.url === FAMILY_RELATION_EXT_URL);
  }).flat();

  const patientRefToRelationCode = buildPatientRefToRelationCode([...relationsFromPatient, ...relationsForMembers]);

  const members = familyData.map((rawFamilyMember: FamilyMembersResponse) => {
    const mainEntry = rawFamilyMember?.entry?.resource?.entry[0];
    const extensions = mainEntry?.resource?.extension;

    const familyPatientId = mainEntry?.resource?.id || '';
    return ({
      id: familyPatientId,
      firstName: mainEntry?.resource?.name[0]?.given[0] || '',
      lastName: mainEntry?.resource?.name[0]?.family || '',
      isProband: findBooleanValueFromExtensions(PROBAND_EXT_URL, extensions),
      ramq: getRAMQValue(mainEntry?.resource || {}),
      birthDate: mainEntry?.resource?.birthDate || '',
      gender: mainEntry?.resource?.gender || '',
      relationCode: patientRefToRelationCode[familyPatientId],
      isFetus: findBooleanValueFromExtensions(FETUS_EXT_URL, extensions),
    } as FamilyMember);
  });

  if (patient) {
    // patient isn't included in `familyData` so we manually add it
    const patientId = patient.id || '';
    const extensions = patient?.extension;

    members.push({
      id: patientId,
      isProband: findBooleanValueFromExtensions(PROBAND_EXT_URL, extensions),
      firstName: patient.name[0].given[0],
      lastName: patient.name[0].family,
      ramq: getRAMQValue(patient),
      birthDate: patient.birthDate,
      gender: patient.gender as ('male' | 'female'),
      code: 'AFF',
      relationCode: patientRefToRelationCode[patientId],
      isFetus: findBooleanValueFromExtensions(FETUS_EXT_URL, extensions),
    });
  }
  return members;
};

const CODES_FOR_MOTHER = [FamilyMemberType.MOTHER.valueOf(), FamilyMemberType.NATURAL_MOTHER_OF_FETUS.valueOf()];

export const isFetusOnly = (fm: FamilyMember) => fm
  && fm.isFetus
  && fm.relationCode
  && !CODES_FOR_MOTHER.includes(fm.relationCode);

export const hasAtLeastOneMotherInMembers = (members: FamilyMember[]) => (members || [])
  .some((fm) => fm.relationCode && CODES_FOR_MOTHER.includes(fm.relationCode));

export const hasAtLeastOneFatherInMembers = (members: FamilyMember[]) => (members || [])
  .some((fm) => fm.relationCode && FamilyMemberType.FATHER === fm.relationCode);
