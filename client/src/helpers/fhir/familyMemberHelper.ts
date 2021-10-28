import { FamilyMember, FamilyMembersResponse, FamilyMemberType } from 'store/FamilyMemberTypes';
import { Gender } from 'store/PatientTypes';

import { getRAMQValue, GroupMemberStatusCode } from './patientHelper';
import { BackboneElement, Bundle, Extension, FamilyGroup, Patient } from './types';

const FAMILY_RELATION_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation';
const PROBAND_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband';
const FETUS_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus';

type RefToCode = {
  [index: string]: string;
};

const buildPatientRefToRelationCode = (relations: Extension[]) =>
  (relations || []).reduce<RefToCode>((accumulator: RefToCode, relation: Extension) => {
    const extension = relation?.extension || [];
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
  }, {});

const findBooleanValueFromExtensions = (url: string, extensions: Extension[]) =>
  !!(extensions || []).find((ext) => ext.url === url)?.valueBoolean;

export const parseFamilyMember = (
  familyData?: FamilyMembersResponse[],
  patient?: Patient,
): FamilyMember[] => {
  if (!familyData || familyData.length === 0) {
    return [];
  }

  const relationsFromPatient =
    patient?.extension?.filter((ext) => ext.url === FAMILY_RELATION_EXT_URL) || [];
  const relationsForMembers = familyData
    .map((rawFamilyMember: FamilyMembersResponse) => {
      const mainEntry = rawFamilyMember?.entry?.resource?.entry[0];
      const extensions = mainEntry?.resource?.extension || [];
      return extensions.filter((ext) => ext.url === FAMILY_RELATION_EXT_URL);
    })
    .flat();

  const patientRefToRelationCode = buildPatientRefToRelationCode([
    ...relationsFromPatient,
    ...relationsForMembers,
  ]);

  return familyData.map((rawFamilyMember: FamilyMembersResponse) => {
    const mainEntry = rawFamilyMember?.entry?.resource?.entry[0];
    const extensions = mainEntry?.resource?.extension;

    const familyPatientId = mainEntry?.resource?.id || '';
    return {
      birthDate: mainEntry?.resource?.birthDate || '',
      code: rawFamilyMember.entry?.groupMemberStatusCode,
      firstName: mainEntry?.resource?.name[0]?.given[0] || '',
      gender: mainEntry?.resource?.gender || '',
      id: familyPatientId,
      isFetus: findBooleanValueFromExtensions(FETUS_EXT_URL, extensions),
      isProband: findBooleanValueFromExtensions(PROBAND_EXT_URL, extensions),
      lastName: mainEntry?.resource?.name[0]?.family || '',
      ramq: getRAMQValue(mainEntry?.resource || {}),
      relationCode: patientRefToRelationCode[familyPatientId],
    } as FamilyMember;
  });
};

const CODES_FOR_MOTHER = [
  FamilyMemberType.MOTHER.valueOf(),
  FamilyMemberType.NATURAL_MOTHER_OF_FETUS.valueOf(),
];

export const isFetusOnly = (fm: FamilyMember): boolean =>
  !!fm && fm.isFetus && !!fm.relationCode && !CODES_FOR_MOTHER.includes(fm.relationCode);

export const isNaturalMotherOfFetus = (fm: FamilyMember): boolean =>
  !!fm && !!fm.relationCode && FamilyMemberType.NATURAL_MOTHER_OF_FETUS === fm.relationCode;

export const findNaturalMotherOfFetus = (members: FamilyMember[]): FamilyMember | null =>
  (members || []).find((fm) => isNaturalMotherOfFetus(fm)) || null;

export const hasAtLeastOneMotherInMembers = (members: FamilyMember[]): boolean =>
  (members || []).some((fm) => fm.relationCode && CODES_FOR_MOTHER.includes(fm.relationCode));

export const hasAtLeastOneFatherInMembers = (members: FamilyMember[]): boolean =>
  (members || []).some((fm) => fm.relationCode && FamilyMemberType.FATHER === fm.relationCode);

export const parentTypeToGender = {
  [FamilyMemberType.FATHER.valueOf()]: Gender.Male,
  [FamilyMemberType.MOTHER.valueOf()]: Gender.Female,
};

export const hasAtLeastOneOtherMember = (patientId: string, members: FamilyMember[]): boolean =>
  (members || []).some((member) => member.id !== patientId);

export const addNewMemberStatusToFamilyMember = ({
  memberIdToUpdate,
  members,
  newStatus,
}: {
  members: FamilyMember[];
  newStatus: GroupMemberStatusCode;
  memberIdToUpdate: string;
}): FamilyMember[] =>
  (members || []).map((member) =>
    member.id === memberIdToUpdate ? { ...member, code: newStatus } : { ...member },
  );

export const isMemberProband = (fm: FamilyMember): boolean => !!fm && fm.isProband;

export const isMemberAloneAccordingToGroupBundle = (
  memberId: string,
  groupBundle: Bundle,
): boolean => {
  const groupResources =
    (groupBundle?.entry || []).map((entry) => ({ ...entry.resource } as FamilyGroup)) || [];
  /*
   * Legacy (zombie groups):
   * a patient can have multiple groups associated to him/her at the time of this writing.
   * As long as this situation remains, all we need to check is that the member is alone
   * in all of them. This check should be valid if the zombie issue is resolved.
   * */
  const membersFromAllGroups = groupResources
    .map((resource) => resource.member || [])
    .flat() as BackboneElement[];
  return membersFromAllGroups.every(
    (member) => member?.entity?.reference === `Patient/${memberId}`,
  );
};
