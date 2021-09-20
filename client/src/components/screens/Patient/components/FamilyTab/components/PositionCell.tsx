import { Tag } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { FamilyMember, FamilyMemberType } from '../../../../../../store/FamilyMemberTypes';

type Props = {
  familyMember: FamilyMember
}

type Dictionary = Record<string, string>

const translateRelationCode = (code: string, dictionary: Dictionary) => dictionary[code] || '--';

const PositionCell = ({
  familyMember,
}: Props) => {
  const relationTranslations = {
    [FamilyMemberType.MOTHER]: intl.get('screen.patient.details.mother'),
    [FamilyMemberType.NATURAL_MOTHER_OF_FETUS]: intl.get('screen.patient.details.mother'),
    [FamilyMemberType.FATHER]: intl.get('screen.patient.details.father'),
  } as Dictionary;

  const { isProband } = familyMember;
  const positionTextToProband = isProband
    ? 'Proband'
    : translateRelationCode(familyMember.relationCode || '', relationTranslations);
  return <Tag color={isProband ? 'red' : 'geekblue'}>{ positionTextToProband }</Tag>;
};

export default PositionCell;
