import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { navigateToPatientScreen } from 'actions/router';
import {
  Button,
  Col,   Row, Tag, Typography, } from 'antd';
import { ParsedPatientData } from 'helpers/providers/types';

import FemaleIcon from 'components/Assets/Icons/FemaleIcon'
import MaleIcon from 'components/Assets/Icons/MaleIcon';
import UnknowGenderIcon from 'components/Assets/Icons/UnknowGenderIcon'

import './styles.scss';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',

}

const getGenderIcon = (gender: string) => {
  if (gender === Gender.FEMALE) {
    return (
      <FemaleIcon className="customIcon" height="22" viewBox="0 0 22 22" width="22" />
    );
  }else if (gender === Gender.UNKNOWN){
    return (
      <UnknowGenderIcon className="customIcon" height="23" viewBox="0 0 22 23" width="22" />
    );
  }else if (gender === Gender.MALE){
    <MaleIcon className="customIcon" height="22" viewBox="0 0 22 22" width="22"/>
  }
};

const buildName = (name: {lastName: string, firstName: string}, isFetus: boolean, onNavigateToMotherFile: () => void) => {
  if (isFetus) {
    return (
      <span>
        { `${intl.get('screen.patient.details.fetus')} ` }
        <span className="patient-page__header__name__mother-name">
          (
          <Button className="link--underline" onClick={() => onNavigateToMotherFile()} type="link">
            { `${name.lastName.toUpperCase()} ${name.firstName}` }
          </Button>
          )
        </span>

      </span>
    );
  }

  return <span>{ `${name.lastName.toUpperCase()} ${name.firstName}` }</span>;
};

interface Props {
  patient: ParsedPatientData
}

const PatientHeader: React.FC<Props> = ({ patient }) => {
  const dispatch = useDispatch();

  return (
    <div className="header__content--static">
      <Row align="bottom" className="flex-row patient-header" gutter={12}>
        <Col>
          <Typography.Title className="patient-page__header__name" level={3}>
            { buildName(
              { firstName: patient.firstName, lastName: patient.lastName },
              patient.isFetus,
              () => dispatch(navigateToPatientScreen(patient.familyRelation)),
            ) }
          </Typography.Title>
        </Col>
        { !patient.isFetus && (
          <>
            <Col>
              { getGenderIcon(patient.gender) }
            </Col>
            {
              patient.birthDate && (
                <Col>
                  <Tag className="patient-page__header__tags">
                    { patient.birthDate }
                  </Tag>
                </Col>
              )
            }
          </>
        ) }
        <Col>
          <Tag
            className="patient-page__header__tags"
            color={patient.proband === 'Parent' ? 'geekblue' : 'red'}
          >
            { patient.proband }
          </Tag>
        </Col>
        { patient.isFetus && (
          <Col>
            <Tag
              className="patient-page__header__tags"
              color="purple"
            >
              { intl.get('screen.patient.details.fetus') }
            </Tag>
          </Col>
        ) }
      </Row>
    </div>
  );
};

export default PatientHeader;
