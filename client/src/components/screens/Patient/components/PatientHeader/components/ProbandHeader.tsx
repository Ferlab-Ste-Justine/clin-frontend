import React from 'react';
import intl from 'react-intl-universal';
import { Col, Tag, Typography } from 'antd';
import { ParsedPatientData } from 'helpers/providers/types';

import FemaleIcon from 'components/Assets/Icons/FemaleIcon'
import MaleIcon from 'components/Assets/Icons/MaleIcon';
import UnknowGenderIcon from 'components/Assets/Icons/UnknowGenderIcon'

import '../styles.scss';
  
enum Gender {
MALE = 'male',
FEMALE = 'female',
UNKNOWN = 'unknown',
}  

const getGenderIcon = (gender: string) => {
  switch (gender) {
  case Gender.MALE:
    return <MaleIcon className="customIcon" height="22" viewBox="0 0 22 22" width="22"/>;
  case Gender.FEMALE:
    return <FemaleIcon className="customIcon" height="22" viewBox="0 0 22 22" width="22" />;
  case Gender.UNKNOWN:
    return <UnknowGenderIcon className="customIcon" height="23" viewBox="0 0 22 23" width="22" />
  }
};

interface Props {
    patient: ParsedPatientData
  }

const ProbandHeader= ({ patient }:Props): React.ReactElement => (
  <>
    <Col>
      <Typography.Title className="patient-page__header__name" level={3}>
        { `${patient.lastName.toUpperCase()} ${patient.firstName}` }
      </Typography.Title>
    </Col>
    <Col>
      <Typography.Title className='patient-page__header__id' level={4}>
            (ID: {patient.id})
      </Typography.Title>
    </Col>
    <Col>
      {getGenderIcon(patient.gender)}
    </Col>
    <Col>
      <Tag
        className="patient-page__header__tags"
        color={patient.proband === 'Parent' ? 'geekblue' : 'red'}
      >
        {patient.proband}
      </Tag>
    </Col>
    <Col>
      <Tag
        className="patient-page__header__tags"
      >
        <span>RAMQ :</span> {patient.ramq}
      </Tag>
    </Col>
    {
      patient.birthDate && (
        <Col>
          <Tag className="patient-page__header__tags">
            <span>{ intl.get('screen.patient.details.header.dob') } :</span>{ patient.birthDate }
          </Tag>
        </Col>
      )
    }
  </>
);

export default ProbandHeader;