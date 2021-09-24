import React from 'react';
import intl from 'react-intl-universal';
import { Tag } from 'antd';
import { isNaturalMotherOfFetus } from 'helpers/fhir/familyMemberHelper';

import { FamilyMember, FamilyMemberType } from 'store/FamilyMemberTypes';

type Props = {
  familyMember: FamilyMember;
};

type Dictionary = Record<string, string>;

const translateRelationCode = (code: string, dictionary: Dictionary) => dictionary[code] || '--';

const PositionCell = ({ familyMember }: Props): React.ReactElement => {
  const relationTranslations = {
    [FamilyMemberType.MOTHER]: intl.get('screen.patient.details.mother'),
    [FamilyMemberType.NATURAL_MOTHER_OF_FETUS]: intl.get('screen.patient.details.mother'),
    [FamilyMemberType.FATHER]: intl.get('screen.patient.details.father'),
  } as Dictionary;

  const { isProband } = familyMember;

  const shouldDisplayProband = isProband && !isNaturalMotherOfFetus(familyMember);
  const positionTextToProband = shouldDisplayProband
    ? 'Proband'
    : translateRelationCode(familyMember.relationCode || '', relationTranslations);

  return <Tag color={shouldDisplayProband ? 'red' : 'geekblue'}>{positionTextToProband}</Tag>;
};

export default PositionCell;
