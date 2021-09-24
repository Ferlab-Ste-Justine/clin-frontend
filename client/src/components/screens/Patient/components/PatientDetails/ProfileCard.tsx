import React from 'react';
import IconKit from 'react-icons-kit';
import { ic_perm_contact_calendar } from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import { navigateToPatientScreen } from 'actions/router';
import { Button, Tag, Typography } from 'antd';
import { findNaturalMotherOfFetus } from 'helpers/fhir/familyMemberHelper';
import { ParsedPatientData } from 'helpers/providers/types';
import { State } from 'reducers';

import { FamilyMember } from 'store/FamilyMemberTypes';

type Props = { patient: ParsedPatientData };

const ProfileCard = ({ patient }: Props): React.ReactElement => {
  const dispatch = useDispatch();

  const familyMembers = useSelector<State>((state) => state.patient.family) as FamilyMember[];
  const motherOfFetus = findNaturalMotherOfFetus(familyMembers);

  const patientProbandDescription = patient.proband;

  return (
    <div className="patient-section__name-block">
      <IconKit icon={ic_perm_contact_calendar} size={56} style={{ color: '#DADADA' }} />
      {patient.isFetus ? (
        <>
          <Typography.Title className="patientName" level={3}>
            {intl.get('screen.patient.details.fetus')}
          </Typography.Title>
          <Button
            className="link--underline"
            onClick={() => dispatch(navigateToPatientScreen(patient.familyRelation))}
            type="link"
          >
            {`${motherOfFetus?.lastName?.toUpperCase()} ${motherOfFetus?.firstName} (${intl
              .get('screen.patient.details.mother')
              .toLowerCase()})`}
          </Button>
        </>
      ) : (
        <>
          <Typography.Title className="patientName" level={3}>
            {patient.lastName.toUpperCase()}
          </Typography.Title>
          <Typography.Title className="patientName" level={4}>
            {patient.firstName}
          </Typography.Title>
        </>
      )}
      <div className="patient-section__name-block__tags">
        <Tag color={patientProbandDescription === 'Proband' ? 'red' : 'geekblue'}>
          {patientProbandDescription}
        </Tag>
        {patient.isFetus && <Tag color="purple">{intl.get('screen.patient.details.fetus')}</Tag>}
      </div>
    </div>
  );
};

export default ProfileCard;
