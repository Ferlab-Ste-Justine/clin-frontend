/* eslint-disable jsx-a11y/anchor-is-valid */

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  Col, Row, Layout, Radio, Icon, Button, Typography,
} from 'antd';

import { patientShape } from '../../../reducers/patient';
import { searchShape } from '../../../reducers/search';

const { Text } = Typography;


export const PatientNavigation = ({
  intl, patient, search, navigateToPatientScreen, navigateToPatientSearchScreen,
}) => {
  const backToSearch = intl.formatMessage({ id: 'screen.patient.backToSearch' });
  const patients = search.patient;
  const patientsCount = patients.total;
  const currentPatientId = patient.details.id;
  const currentPatientMRN = patient.details.mrn;
  const currentPatientIndex = _.findIndex(patients.results, { details: { id: currentPatientId } });
  const previousPatientIndex = (currentPatientIndex - 1) >= 0 ? (currentPatientIndex - 1) : null;
  const previousPatient = previousPatientIndex ? patients.results[previousPatientIndex] : null;
  const nextPatientIndex = (currentPatientIndex + 1) < patientsCount ? (currentPatientIndex + 1) : null;
  const nextPatient = nextPatientIndex ? patients.results[nextPatientIndex] : null;

  return (
    <Layout.Content
      className="patient-navigation"
    >
      <Row type="flex" justify="space-between" align="middle">
        <Col span={6} align="start">
          <Button type="secondary">
            <Text strong>{`MRN: ${currentPatientMRN}`}</Text>
          </Button>
        </Col>
        <Col span={10} align="center">
          <Radio.Group>
            { previousPatient ? (
              <Radio.Button>
                <a href="#" data-patient-id={previousPatient.details.id} onClick={navigateToPatientScreen}>
                  <Icon type="left" />
                  <Text>{`MRN: ${previousPatient.details.mrn}`}</Text>
                </a>
              </Radio.Button>
            ) : null }
            <Radio.Button disabled>
              <Text>{`Search Results ${currentPatientIndex} of ${patientsCount}`}</Text>
            </Radio.Button>
            { nextPatient ? (
              <Radio.Button>
                <a href="#" data-patient-id={nextPatient.details.id} onClick={navigateToPatientScreen}>
                  <Text>{`MRN: ${nextPatient.details.mrn}`}</Text>
                  <Icon type="right" />
                </a>
              </Radio.Button>
            ) : null }
          </Radio.Group>
        </Col>
        <Col span={6} align="end">
          <a href="#" onClick={navigateToPatientSearchScreen}>
            <Button type="primary" icon="left">
              {backToSearch}
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
