import { GroupMemberStatusCode } from '../helpers/fhir/patientHelper';
import { Patient } from '../helpers/fhir/types';

export enum FamilyMemberType {
  FATHER = 'FTH',
  MOTHER = 'MTH',
  NATURAL_MOTHER_OF_FETUS = 'NMTHF',
  DAUGHTER = 'DTH',
  NEPHEW = 'NEPHEW',
  NIECE = 'NIECE',
}

export type FamilyMember = {
  id: string;
  lastName: string;
  firstName: string;
  isProband: boolean;
  ramq?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  code: GroupMemberStatusCode;
  relationCode?: string;
  isFetus: boolean;
};

export type FamilyMembersResponse = {
  entry: {
    resource: {
      id: string;
      entry: { fullUrl: string; resource: Patient }[];
      [index: string]: any;
    };
    groupMemberStatusCode?: GroupMemberStatusCode;
  };
};
