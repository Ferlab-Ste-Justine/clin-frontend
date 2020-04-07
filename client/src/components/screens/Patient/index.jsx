/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Col, Row, Tabs, PageHeader, Typography, Icon, Button, Spin,
} from 'antd';
import ResizableAntdTable from 'resizable-antd-table';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';
import { patientShape } from '../../../reducers/patient';
import { searchShape } from '../../../reducers/search';
import { appShape } from '../../../reducers/app';
import {
  navigateToPatientScreen, navigateToPatientVariantScreen,
  navigateToPatientSearchScreen,
} from '../../../actions/router';

import './style.scss';


class PatientScreen extends React.Component {
  constructor() {
    super();
    this.handleNavigationToPatientScreen = this.handleNavigationToPatientScreen.bind(this);
    this.handleNavigationToPatientSearchScreen = this.handleNavigationToPatientSearchScreen.bind(this);
    this.handleNavigationToPatientVariantScreen = this.handleNavigationToPatientVariantScreen.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);
  }

  handleNavigationToPatientScreen(e) {
    const { actions } = this.props;
    actions.navigateToPatientScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
  }

  handleNavigationToPatientVariantScreen(e) {
    const { actions } = this.props;
    actions.navigateToPatientVariantScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
  }

  handleNavigationToPatientSearchScreen() {
    const { actions } = this.props;
    actions.navigateToPatientSearchScreen(false);
  }

  handleTabNavigation(tab) {
    const { actions, patient } = this.props;
    actions.navigateToPatientScreen(patient.details.id, tab);
  }

  render() {
    const {
      app, router, patient, actions,
    } = this.props;

    const { showSubloadingAnimation } = app;
    const { hash } = router.location;
    const identifier = intl.get('screen.patient.details.id');
    const mrn = intl.get('screen.patient.details.mrn');
    const ramq = intl.get('screen.patient.details.ramq');
    const dateOfBirth = intl.get('screen.patient.details.dob');
    const organization = intl.get('screen.patient.details.organization');
    const firstName = intl.get('screen.patient.details.firstName');
    const lastName = intl.get('screen.patient.details.lastName');
    const gender = intl.get('screen.patient.details.gender');
    const pfamily = intl.get('screen.patient.details.family');
    const ethnicity = intl.get('screen.patient.details.ethnicity');
    const study = intl.get('screen.patient.details.study');
    const proband = intl.get('screen.patient.details.proband');
    const position = intl.get('screen.patient.details.position');
    const preferringPractitioner = intl.get('screen.patient.details.referringPractitioner');
    const mln = intl.get('screen.patient.details.mln');
    const id = intl.get('screen.patient.details.id');
    const practitioner = intl.get('screen.patient.details.practitioner');
    const date = intl.get('screen.patient.details.date');
    const ageAtConsultation = intl.get('screen.patient.details.ageAtConsultation');
    const type = intl.get('screen.patient.details.type');
    const author = intl.get('screen.patient.details.author');
    const specimen = intl.get('screen.patient.details.specimen');
    const consultation = intl.get('screen.patient.details.consultation');
    const status = intl.get('screen.patient.details.status');
    const request = intl.get('screen.patient.details.request');
    const barcode = intl.get('screen.patient.details.barcode');
    const code = intl.get('screen.patient.details.code');
    const term = intl.get('screen.patient.details.term');
    const notes = intl.get('screen.patient.details.notes');
    const mother = intl.get('screen.patient.details.mother');
    const father = intl.get('screen.patient.details.father');
    const familyId = intl.get('screen.patient.details.familyId');
    const configuration = intl.get('screen.patient.details.configuration');
    const dateAndTime = intl.get('screen.patient.details.dateAndTime');
    const ontology = intl.get('screen.patient.details.ontology');
    const observed = intl.get('screen.patient.details.observed');
    const apparition = intl.get('screen.patient.details.apparition');
    const identification = intl.get('screen.patient.header.identification');
    const additionalInformation = intl.get('screen.patient.header.additionalInformation');
    const referringPractitioner = intl.get('screen.patient.header.referringPractitioner');
    const geneticalConsultations = intl.get('screen.patient.header.geneticalConsultations');
    const requests = intl.get('screen.patient.header.requests');
    const samples = intl.get('screen.patient.header.samples');
    const clinicalSigns = intl.get('screen.patient.header.clinicalSigns');
    const indications = intl.get('screen.patient.header.indications');
    const generalObservations = intl.get('screen.patient.header.generalObservations');
    const family = intl.get('screen.patient.header.family');
    const familyHistory = intl.get('screen.patient.header.familyHistory');
    const generalInformation = intl.get('screen.patient.header.generalInformation');
    const familyMembers = intl.get('screen.patient.header.familyMembers');
    const patientTab = intl.get('screen.patient.tab.patient');
    const clinicalTab = intl.get('screen.patient.tab.clinical');
    const motherLink = patient.family.members.mother ? (
          <a /* eslint-disable-line */
            data-patient-id={patient.family.members.mother}
            onClick={(e) => {
              actions.navigateToPatientScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
            }}
          >
            {patient.family.members.mother}
          </a>) : '';
    const fatherLink = patient.family.members.father ? (
          <a /* eslint-disable-line */
            data-patient-id={patient.family.members.father}
            onClick={(e) => {
              actions.navigateToPatientScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
            }}
          >
            {patient.family.members.father}
          </a>) : '';

    return (
      <Content type="auto">
        <Header />
        <Spin spinning={showSubloadingAnimation}>
          <Card className="entity">
          <PageHeader
            title={(
              <div>
                <Typography.Title level={2} style={{ display: 'inline' }}>
                  {`${patient.details.firstName} ${patient.details.lastName}`}
                </Typography.Title>
                <Typography.Title level={2} style={{ fontWeight: 'normal', display: 'inline' }}>
                  {`, ${patient.details.birthDate}`}
                </Typography.Title>
              </div>
            )}
            extra={(
              <a href="#" data-patient-id={patient.details.id} onClick={this.handleNavigationToPatientVariantScreen}>
                <Button type="primary">
                  Variant Interpreter
                </Button>
              </a>
            )}
          />
          <br />
          <Tabs key={patient.details.id} onChange={this.handleTabNavigation} defaultActiveKey={(hash ? hash.replace('#', '') : 'patient')} className="tabs">
            <Tabs.TabPane
              key="personal"
              style={{ height: '100%' }}
              tab={(
                <span>
                    <Icon type="profile" />
                  {patientTab}
                  </span>
              )}
            >
              <br />
              <Row type="flex" gutter={32}>
                <Col span={12} className="gutter-row">
                  <DataList
                    title={identification}
                    dataSource={[
                      { label: identifier, value: patient.details.id },
                      { label: mrn, value: patient.details.mrn },
                      { label: ramq, value: patient.details.ramq },
                      { label: organization, value: patient.organization.name },
                      { label: firstName, value: patient.details.firstName },
                      { label: lastName, value: patient.details.lastName },
                      { label: dateOfBirth, value: patient.details.birthDate },
                      { label: gender, value: patient.details.gender },
                    ]}
                  />
                </Col>
                <Col span={12} className="gutter-row">
                  <DataList
                    title={additionalInformation}
                    dataSource={[
                      { label: ethnicity, value: patient.details.ethnicity },
                      { label: pfamily, value: patient.family.id },
                      { label: position, value: patient.details.proband },
                      { label: study, value: patient.study.name },
                    ]}
                  />
                  <DataList
                    style={{ marginTop: '10px' }}
                    title={referringPractitioner}
                    dataSource={[
                      { label: preferringPractitioner, value: patient.practitioner.name },
                      { label: mln, value: patient.practitioner.mln },
                    ]}
                  />
                </Col>
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{geneticalConsultations}</Typography.Title>
                <ResizableAntdTable
                  bordered
                  style={{ width: '100%' }}
                  pagination={false}
                  columns={[
                    { title: id, dataIndex: 'id', key: 'id' },
                    { title: practitioner, dataIndex: 'assessor', key: 'assessor' },
                    { title: organization, dataIndex: 'organization', key: 'organization' },
                    { title: date, dataIndex: 'date', key: 'date' },
                    { title: ageAtConsultation, dataIndex: 'age', key: 'age' },
                  ]}
                  dataSource={patient.consultations}
                  size="small"
                  rowKey="id"
                />
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{requests}</Typography.Title>
                <ResizableAntdTable
                  bordered
                  style={{ width: '100%' }}
                  pagination={false}
                  columns={[
                    { title: id, dataIndex: 'id', key: 'id' },
                    { title: date, dataIndex: 'date', key: 'date' },
                    { title: type, dataIndex: 'type', key: 'type' },
                    { title: author, dataIndex: 'requester', key: 'requester' },
                    { title: organization, dataIndex: 'organization', key: 'organization' },
                    { title: specimen, dataIndex: 'specimen', key: 'specimen' },
                    { title: consultation, dataIndex: 'consulation', key: 'consulation' },
                    { title: status, dataIndex: 'status', key: 'status' },
                  ]}
                  dataSource={patient.requests}
                  size="small"
                  rowKey="id"
                />
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{samples}</Typography.Title>
                <ResizableAntdTable
                  bordered
                  style={{ width: '100%' }}
                  pagination={false}
                  columns={[
                    { title: id, dataIndex: 'id', key: 'id' },
                    { title: barcode, dataIndex: 'barcode', key: 'barcode' },
                    { title: type, dataIndex: 'type', key: 'type' },
                    { title: request, dataIndex: 'request', key: 'request' },
                  ]}
                  dataSource={patient.samples}
                  size="small"
                  rowKey="id"
                />
              </Row>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="clinical"
              tab={(
                <span>
                    <Icon type="reconciliation" />
                  {clinicalTab}
                  </span>
              )}
              style={{ height: '100%' }}
            >
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{clinicalSigns}</Typography.Title>
                <ResizableAntdTable
                  bordered
                  style={{ width: '100%' }}
                  pagination={false}
                  columns={
                    [
                      { title: ontology, dataIndex: 'ontology', key: 'ontology' },
                      { title: code, dataIndex: 'code', key: 'code' },
                      { title: term, dataIndex: 'term', key: 'term' },
                      { title: observed, dataIndex: 'observed', key: 'observed' },
                      { title: consultation, dataIndex: 'consultation_date', key: 'consultation_date' },
                      { title: apparition, dataIndex: 'apparition_date', key: 'apparition_date' },
                    ]
                  }
                  dataSource={patient.ontology}
                  size="small"
                  rowKey="code"
                />
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{indications}</Typography.Title>
                <ResizableAntdTable
                  bordered
                  style={{ width: '100%' }}
                  pagination={false}
                  columns={[
                    { title: notes, dataIndex: 'note', key: 'note' },
                    { title: consultation, dataIndex: 'consultation_date', key: 'consultation_date' },
                  ]}
                  dataSource={patient.indications}
                  size="small"
                  rowKey="consultation"
                />
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{generalObservations}</Typography.Title>
                <ResizableAntdTable
                  bordered
                  style={{ width: '100%' }}
                  pagination={false}
                  columns={[
                    { title: notes, dataIndex: 'note', key: 'note' },
                    { title: consultation, dataIndex: 'consultation_date', key: 'consultation_date' },
                  ]}
                  dataSource={patient.observations}
                  size="small"
                  rowKey="consultation"
                />
              </Row>
              <br />
              <br />
              <Row type="flex">
                <br />
                <Col span={24}>
                  <Typography.Title level={4}>{family}</Typography.Title>
                </Col>
              </Row>
              <Row type="flex" gutter={32}>
                <Col span={12} className="gutter-row">
                  <DataList
                    title={generalInformation}
                    dataSource={[
                      { label: familyId, value: patient.family.id },
                      { label: configuration, value: patient.family.composition },
                    ]}
                  />
                </Col>
                <Col span={12} className="gutter-row">
                  <DataList
                    title={familyMembers}
                    dataSource={[
                      { label: proband, value: patient.family.members.proband },
                      { label: father, value: fatherLink },
                      { label: mother, value: motherLink },
                    ]}
                  />
                </Col>
              </Row>
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{familyHistory}</Typography.Title>
                <ResizableAntdTable
                  bordered
                  style={{ width: '100%' }}
                  pagination={false}
                  columns={[
                    { title: notes, dataIndex: 'note', key: 'note' },
                    { title: dateAndTime, dataIndex: 'date', key: 'date' },
                  ]}
                  dataSource={patient.familyHistory}
                  size="small"
                  rowKey="date"
                />
              </Row>
            </Tabs.TabPane>
          </Tabs>
        </Card>
        <Footer />
        </Spin>

      </Content>
    );
  }
}

PatientScreen.propTypes = {
  app: PropTypes.shape(appShape).isRequired,
  router: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
  search: PropTypes.shape(searchShape).isRequired,
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
)(PatientScreen);
