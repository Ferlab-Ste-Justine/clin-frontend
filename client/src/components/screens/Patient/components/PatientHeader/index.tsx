import React from 'react';
import {
  Row, Col, Tag, Typography, Button,
} from 'antd';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { ParsedPatientData } from '../../../../../helpers/providers/types';
import { navigateToPatientScreen } from '../../../../../actions/router';
import './styles.scss';

const getGenderIcon = (gender: string) => {
  if (gender === 'female') {
    return (
      <i className="customIcon" aria-label="female">
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          { /* eslint-disable-next-line max-len */ }
          <path d="M9 2.25C11.4853 2.25 13.5 4.26472 13.5 6.75C13.5 8.9775 11.88 10.83 9.75 11.19V12.75H11.25V14.25H9.75V15.75H8.25V14.25H6.75V12.75H8.25V11.19C6.12 10.83 4.5 8.9775 4.5 6.75C4.5 4.26472 6.51472 2.25 9 2.25ZM9 3.75C7.34315 3.75 6 5.09315 6 6.75C6 8.40685 7.34315 9.75 9 9.75C10.6569 9.75 12 8.40685 12 6.75C12 5.09315 10.6569 3.75 9 3.75Z" fill="#A7B4C3" />
        </svg>
      </i>
    );
  }
  return (
    <i className="customIcon" aria-label="male">
      <svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        { /* eslint-disable-next-line max-len */ }
        <path d="M6.75 6.75C7.7175 6.75 8.625 7.0575 9.3525 7.5825L13.185 3.75H9.75V2.25H15.75V8.25H14.25V4.8075L10.4175 8.625C10.9425 9.375 11.25 10.275 11.25 11.25C11.25 13.7353 9.23528 15.75 6.75 15.75C4.26472 15.75 2.25 13.7353 2.25 11.25C2.25 8.76472 4.26472 6.75 6.75 6.75ZM6.75 8.25C5.09315 8.25 3.75 9.59315 3.75 11.25C3.75 12.9069 5.09315 14.25 6.75 14.25C8.40685 14.25 9.75 12.9069 9.75 11.25C9.75 9.59315 8.40685 8.25 6.75 8.25Z" fill="#A7B4C3" />
      </svg>
    </i>
  );
};

const buildName = (name: {lastName: string, firstName: string}, isFetus: boolean, onNavigateToMotherFile: () => void) => {
  if (isFetus) {
    return (
      <span>
        { `${intl.get('screen.patient.details.fetus')} ` }
        <span className="patient-page__header__name__mother-name">
          (
          <Button type="link" className="link--underline" onClick={() => onNavigateToMotherFile()}>
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
          <Typography.Title level={3} className="patient-page__header__name">
            { buildName(
              { lastName: patient.lastName, firstName: patient.firstName },
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
