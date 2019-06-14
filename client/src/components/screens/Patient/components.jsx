/* eslint-disable jsx-a11y/anchor-is-valid */

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


  // @TODO INFER PREVIOUS AND NEXT BASED ON CURRENT PATIENT ID

  // const currentPatientId = 'PA000011';
  const currentPatientMRN = patient.details.mrn;
  const currentPatientIndex = 1;

  const previousPatientId = 'PA000010';
  const previousPatientMRN = '483724';


  const nextPatientId = 'PA000012';
  const nextPatientMRN = '483726';


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
            <Radio.Button>
              <a href="#" data-patient-id={previousPatientId} onClick={navigateToPatientScreen}>
                <Icon type="left" />
                <Text>{`MRN: ${previousPatientMRN}`}</Text>
              </a>
            </Radio.Button>
            <Radio.Button disabled>
              <Text>{`Search Results ${currentPatientIndex} of ${patients.results.length}`}</Text>
            </Radio.Button>
            <Radio.Button>
              <a href="#" data-patient-id={nextPatientId} onClick={navigateToPatientScreen}>
                <Text>{`MRN: ${nextPatientMRN}`}</Text>
                <Icon type="right" />
              </a>
            </Radio.Button>
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
