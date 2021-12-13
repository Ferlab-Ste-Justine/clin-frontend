import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { navigateToPatientScreen } from 'actions/router';
import { Button, Col, Tag, Typography } from 'antd';
import { ParsedPatientData } from 'helpers/providers/types';

import { getGenderIcon } from 'components/Utils/getGenderIcon';

import './styles.scss';
  

interface Props {
    patient: ParsedPatientData
  }

const FetusHeader= ({ patient }:Props): React.ReactElement => {
  const dispatch = useDispatch();
  return(  
    <>
      <Col>
        <Typography.Title className="patient-page__header__name" level={3}>
        ID : {patient.id}
        </Typography.Title>
      </Col>
      <Col>
        {getGenderIcon(patient.gender)}
      </Col>
      <Col>
        <Tag
          className="patient-page__header__tags"
          color="purple"
        >
          { intl.get('screen.patient.details.header.fetus') }
        </Tag>
      </Col>
      <Col>
        <Tag
          className="patient-page__header__tags"
        >
          <span>{ intl.get('screen.patient.details.header.mother') } :</span> 
          <Button 
            onClick={() => dispatch(navigateToPatientScreen(patient.familyRelation))}
            size='small' 
            type='link'
          >
            { `${patient.lastName.toUpperCase()} ${patient.firstName} (ID : ${patient.familyRelation})` }
          </Button>
        </Tag>
      </Col>
    </>
  )
};

export default FetusHeader;