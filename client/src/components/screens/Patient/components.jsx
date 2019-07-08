/* eslint-disable jsx-a11y/anchor-is-valid */

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  Col, Row, Layout, Radio, Icon, Button, Typography,
} from 'antd';
import { Desktop } from '../../../containers/Responsive';

import { patientShape } from '../../../reducers/patient';
import { searchShape } from '../../../reducers/search';

const { Text } = Typography;


export const PatientNavigation = ({
  intl, patient, search, navigateToPatientScreen, navigateToPatientSearchScreen,
}) => {
  const backToSearch = intl.formatMessage({ id: 'screen.patient.backToSearch' });
  const patients = search.patient;
  const patientsCount = patients.results.length;
  const currentPatientId = patient.details.id;
  const currentPatientMRN = patient.details.mrn;
  const currentPatientIndex = _.findIndex(patients.results, { details: { id: currentPatientId } });
  const previousPatientIndex = currentPatientIndex > 0 ? (currentPatientIndex - 1) : null;
  const previousPatient = previousPatientIndex !== null ? patients.results[previousPatientIndex] : null;
  const nextPatientIndex = currentPatientIndex < patientsCount ? (currentPatientIndex + 1) : null;
  const nextPatient = nextPatientIndex !== null ? patients.results[nextPatientIndex] : null;

  return (
    <Layout.Content
      className="patient-navigation"
    >
      <Row type="flex" justify="space-between" align="middle">
        <Col sm={6} md={6} lg={6} align="start">
          <Button type="secondary">
            <Icon type="idcard" />
            <Text strong>{`MRN ${currentPatientMRN}`}</Text>
          </Button>
        </Col>
        <Col sm={16} md={14} lg={12} align="center">
          <Radio.Group>
            { previousPatient ? (
              <Radio.Button>
                <a href="#" data-patient-id={previousPatient.details.id} onClick={navigateToPatientScreen}>
                  <Icon type="caret-left" />
                  <Text>
                    {` MRN ${previousPatient.details.mrn}`}
                  </Text>
                </a>
              </Radio.Button>
            ) : null }
            <Radio.Button disabled>
              <Text>{`${(currentPatientIndex + 1)} / ${patientsCount}`}</Text>
            </Radio.Button>
            { nextPatient ? (
              <Radio.Button>
                <a href="#" data-patient-id={nextPatient.details.id} onClick={navigateToPatientScreen}>
                  <Text>
                    {`MRN ${nextPatient.details.mrn} `}
                  </Text>
                  <Icon type="caret-right" />
                </a>
              </Radio.Button>
            ) : null }
          </Radio.Group>
        </Col>
        <Col sm={2} md={4} lg={6} align="end">
          <a href="#" onClick={navigateToPatientSearchScreen}>
            <Button type="primary" icon="left">
              <Desktop>{backToSearch}</Desktop>
            </Button>
          </a>
        </Col>
      </Row>
    </Layout.Content>
  );
};

PatientNavigation.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
  search: PropTypes.shape(searchShape).isRequired,
  navigateToPatientScreen: PropTypes.func.isRequired,
  navigateToPatientSearchScreen: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  intl: state.intl,
  patient: state.patient,
  search: state.search,
});

export default connect(
  mapStateToProps,
)(injectIntl(PatientNavigation));
