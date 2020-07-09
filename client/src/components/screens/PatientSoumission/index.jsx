/* eslint-disable import/named */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Steps, Card, Form, Input, Button, message, Radio, DatePicker, Select,
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

const { Step } = Steps;

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
          <div style={{ height: '100%', width: '100%' }}>
            Insert Patient Information page component ...
          </div>
        ),
      },
      {
        title: intl.get('screen.clinicalSubmission.clinicalInformation'),
        content: (
          <div style={{ height: '100%', width: '100%' }}>
            Insert Clinical Information page component ...
          </div>
        ),
      },
      {
        title: intl.get('screen.clinicalSubmission.approval'),
        content: (
          <div style={{ height: '100%', width: '100%' }}>
            Insert approval page page component ...
          </div>
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
    const [currentPage] = this.pages;
    const pageContent = currentPage.content;

    return (
      <Content type="auto">
        <Header />
        <div>
          <Steps current={currentPageIndex}>
            {this.pages.map(item => <Step key={item.title} title={item.title} />)}
            <div className="submission-form-page">{pageContent}</div>
          </Steps>
        </div>
        <Card title="Patient" bordered={false}>
          <div className="submission-form-actions">
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
