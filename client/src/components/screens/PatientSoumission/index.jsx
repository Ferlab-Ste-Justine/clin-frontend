/* eslint-disable import/named */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Steps, Card, Form, Input, Button,
} from 'antd';
import {
  find,
} from 'lodash';


import IconKit from 'react-icons-kit';
import {
  ic_person, ic_assignment, ic_done, ic_close, ic_add,
} from 'react-icons-kit/md';
import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';
import { patientShape } from '../../../reducers/patient';
import { appShape } from '../../../reducers/app';
import {
  navigateToPatientScreen, navigateToPatientVariantScreen,
  navigateToPatientSearchScreen,
} from '../../../actions/router';


const columnPresetToColumn = c => ({
  key: c.key, title: intl.get(c.label), dataIndex: c.key,
});

class PatientSoumissionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    const { Step } = Steps;
    // eslint-disable-next-line react/prop-types

    return (
      <Content type="auto">
        <Header />
        <div>
          <Steps current={0}>
            <Step title="Informations patient" />
            <Step title="Informations cliniques" />
            <Step title="Approbation" />
          </Steps>
        </div>
        <Card title="Patient" bordered={false}>
          <Form>
            <Form.Item label="Nom">
              <Input placeholder="Nom de famille" />
            </Form.Item>
            <Form.Item label="Prénom">
              <Input placeholder="Nom de famille" />
            </Form.Item>
            <Form.Item label="Prénom">
              <Input placeholder="Nom de famille" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
            Register
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    );
  }
}

PatientSoumissionScreen.propTypes = {
  router: PropTypes.shape({}).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    navigateToPatientScreen,
    navigateToPatientVariantScreen,
    navigateToPatientSearchScreen,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  router: state.router,
  patient: state.patient,
  search: state.search,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientSoumissionScreen);
