import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { navigateToPatientScreen } from 'actions/router';
import {
  Button,
  Col,   Row, Tag, Typography, } from 'antd';
import { ParsedPatientData } from 'helpers/providers/types';

import './styles.scss';

const getGenderIcon = (gender: string) => {
  if (gender === 'female') {
    return (
      <i aria-label="female" className="customIcon">
        <svg fill="none" height="22" viewBox="0 0 18 18" width="22" xmlns="http://www.w3.org/2000/svg">
          { /* eslint-disable-next-line max-len */ }
          <path d="M9 2.25C11.4853 2.25 13.5 4.26472 13.5 6.75C13.5 8.9775 11.88 10.83 9.75 11.19V12.75H11.25V14.25H9.75V15.75H8.25V14.25H6.75V12.75H8.25V11.19C6.12 10.83 4.5 8.9775 4.5 6.75C4.5 4.26472 6.51472 2.25 9 2.25ZM9 3.75C7.34315 3.75 6 5.09315 6 6.75C6 8.40685 7.34315 9.75 9 9.75C10.6569 9.75 12 8.40685 12 6.75C12 5.09315 10.6569 3.75 9 3.75Z" fill="#A7B4C3" />
        </svg>
      </i>
    );
  }else if (gender === 'unknown'){
    return (
      <i  aria-label="unknown" className="customIcon">
        <svg fill="none" height="23" viewBox="0 0 22 23" width="22" xmlns="http://www.w3.org/2000/svg">
          { /* eslint-disable-next-line max-len */ }
          <path clip-rule="evenodd" d="M12.2962 1.29964L21.3708 10.3742C22.0838 11.0872 22.0838 12.2539 21.3708 12.9669L12.2962 22.0414C11.5833 22.7544 10.4165 22.7544 9.70352 22.0414L0.628988 12.9669C-0.0840115 12.2539 -0.0840117 11.0872 0.628988 10.3742L9.70352 1.29964C10.4165 0.586643 11.5833 0.586643 12.2962 1.29964ZM10.9999 20.7451L20.0744 11.6705L10.9999 2.596L1.92535 11.6705L10.9999 20.7451Z" fill="#8B9DB2" fill-rule="evenodd"/>
          { /* eslint-disable-next-line max-len */ }
          <path clip-rule="evenodd" d="M7.33325 9.83732C7.33325 7.81149 8.97409 6.17065 10.9999 6.17065C13.0258 6.17065 14.6666 7.81149 14.6666 9.83732C14.6666 11.0133 13.9424 11.6462 13.2373 12.2624C12.5684 12.847 11.9166 13.4166 11.9166 14.4207H10.0833C10.0833 12.7512 10.9469 12.0892 11.7062 11.5072C12.3018 11.0506 12.8333 10.6433 12.8333 9.83732C12.8333 8.82899 12.0083 8.00399 10.9999 8.00399C9.99159 8.00399 9.16659 8.82899 9.16659 9.83732H7.33325ZM11.9166 15.3373V17.1707H10.0833V15.3373H11.9166Z" fill="#8B9DB2" fill-rule="evenodd"/>
        </svg>
      </i>
    );
  }
  return (
    <i aria-label="male" className="customIcon">
      <svg fill="none" height="22" viewBox="0 0 18 18" width="22" xmlns="http://www.w3.org/2000/svg">
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
