import React from 'react';
import intl from 'react-intl-universal';
import { Col, Tag, Typography } from 'antd';
import { ParsedPatientData } from 'helpers/providers/types';

import { getGenderIcon } from 'components/Utils/getGenderIcon';

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