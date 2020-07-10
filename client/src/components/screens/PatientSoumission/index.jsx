/* eslint-disable import/named */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Steps, Card, Form, Input, Button, Radio, Select,
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
import './style.scss';

const { Step } = Steps;

const PatientInformation = props => (
  <Card title="Patient" bordered={false} className="patientContent">
    <Form>
      <Form.Item label="Nom">
        <Input placeholder="Nom de famille" />
      </Form.Item>
      <Form.Item label="Prénom">
        <Input placeholder="Prénom" />
      </Form.Item>
      <Form.Item label="Sexe">
        <Radio.Group buttonStyle="solid">
          <Radio.Button value="a">Masculin</Radio.Button>
          <Radio.Button value="b">Féminin</Radio.Button>
          <Radio.Button value="c">Autre</Radio.Button>
          <Radio.Button value="d">Inconnu</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Date de naissance">
        <DatePicker />
      </Form.Item>
      <Form.Item label="RAMQ">
        <Input placeholder="ABCD 0000 0000" />
      </Form.Item>
      <Form.Item label="MRN">
        <Input placeholder="12345678" />
      </Form.Item>
      <Form.Item label="Hôpital">
        <Select defaultValue="CHUSJ">
          <Select.Option value="CHUSJ">CHUSJ</Select.Option>
          <Select.Option value="CHUM">CHUM</Select.Option>
          <Select.Option value="CUSM">CUSM</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Ethnicité" placeholder="Selectionner">
        <Select>
          <Select.Option value="CF">Canadien-Français</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Consanguinité">
        <Radio.Group buttonStyle="solid">
          <Radio.Button value="o">Oui</Radio.Button>
          <Radio.Button value="n">Non</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Form>
  </Card>
);

const ClinicalInformation = props => (
  <Card title="Informations cliniques" bordered={false} className="patientContent">
    <Form>
      <Form.Item label="Lorem ipsum">
        <Input placeholder="bla bla" />
      </Form.Item>
    </Form>
  </Card>
);

const Approval = props => (
  <Card title="Approbation" bordered={false} className="patientContent">
    <Form>
      <Form.Item label="Some field">
        <Input placeholder="a placeholder ..." />
      </Form.Item>
    </Form>
  </Card>
);

class PatientSoumissionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPageIndex: 0,
    };

    this.pages = [
      {
        title: intl.get('screen.clinicalSubmission.patientInformation'),
        content: (
          <PatientInformation />
        ),
      },
      {
        title: intl.get('screen.clinicalSubmission.clinicalInformation'),
        content: (
          <ClinicalInformation />
        ),
      },
      {
        title: intl.get('screen.clinicalSubmission.approval'),
        content: (
          <Approval />
        ),
      },
    ];
  }

  nbPages() {
    return this.pages.length;
  }

  next() {
    const { currentPageIndex } = this.state;
    const pageIndex = currentPageIndex + 1;
    this.setState({ currentPageIndex: pageIndex });
  }

  previous() {
    const { currentPageIndex } = this.state;
    const pageIndex = currentPageIndex - 1;
    this.setState({ currentPageIndex: pageIndex });
  }

  isFirstPage() {
    const { currentPageIndex } = this.state;
    return currentPageIndex === 0;
  }

  isLastPage() {
    const { currentPageIndex } = this.state;
    return currentPageIndex === this.nbPages() - 1;
  }

  render() {
    const { currentPageIndex } = this.state;
    const currentPage = this.pages[currentPageIndex];
    const pageContent = currentPage.content;

    return (
      <Content type="auto">
        <Header />
        <div className="steps">
          <Steps current={currentPageIndex}>
            {this.pages.map(item => <Step key={item.title} title={item.title} />)}
          </Steps>
        </div>

        {pageContent}

        <div className="submission-form-actions">
          <Button type="primary" onClick={() => this.next()} disabled={this.isLastPage()}>
            {intl.get('screen.clinicalSubmission.nextButtonTitle')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => this.previous()} disabled={this.isFirstPage()}>
            {intl.get('screen.clinicalSubmission.previousButtonTitle')}
          </Button>
          <Button
            type="primary"
            onClick={() => message.success('Saved ...')}
          >
            {intl.get('screen.clinicalSubmission.saveButtonTitle')}
          </Button>
          <Button
            type="primary"
            onClick={() => message.success('Cancelled ...')}
          >
            {intl.get('screen.clinicalSubmission.cancelButtonTitle')}
          </Button>
        </div>
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
