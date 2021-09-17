import { Button } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import intl from 'react-intl-universal';
import { navigateToPatientScreen } from '../../../../../../actions/router';
import { FamilyMember } from '../../../../../../store/FamilyMemberTypes';
import { isFetusOnly } from '../../../../../../helpers/fhir/familyMemberHelper';

type Props = {
  familyMember: FamilyMember
}

const NameCell = ({
  familyMember,
}: Props) => {
  const dispatch = useDispatch();

  return (
    <Button
      type="link"
      className="button link--underline family-tab__details__table__name"
      onClick={() => dispatch(navigateToPatientScreen(familyMember.id))}
    >
      { isFetusOnly(familyMember)
        ? intl.get('screen.patient.details.fetus')
        : `${familyMember.firstName} ${familyMember.lastName}` }
    </Button>
  );
};

export default NameCell;
