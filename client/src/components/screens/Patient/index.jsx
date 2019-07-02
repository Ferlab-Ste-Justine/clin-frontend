/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Col, Row, Tabs, PageHeader, Typography, Icon,
} from 'antd';
import ResizableAntdTable from 'resizable-antd-table';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';
import { PatientNavigation } from './components';

import './style.scss';
import { patientShape } from '../../../reducers/patient';
import { searchShape } from '../../../reducers/search';

import { navigateToPatientScreen, navigateToPatientSearchScreen } from '../../../actions/router';


class PatientScreen extends React.Component {
  constructor() {
    super();
    this.handleNavigationToPatientScreen = this.handleNavigationToPatientScreen.bind(this);
    this.handleNavigationToPatientSearchScreen = this.handleNavigationToPatientSearchScreen.bind(this);
  }

  handleNavigationToPatientScreen(e) {
    const { actions } = this.props;
    actions.navigateToPatientScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
  }

  handleNavigationToPatientSearchScreen() {
    const { actions } = this.props;
    actions.navigateToPatientSearchScreen();
  }

  render() {
    const {
      intl, patient, search, actions,
    } = this.props;

    const identifier = intl.formatMessage({ id: 'screen.patient.details.id' });
    const mrn = intl.formatMessage({ id: 'screen.patient.details.mrn' });
    const ramq = intl.formatMessage({ id: 'screen.patient.details.ramq' });
    const dateOfBirth = intl.formatMessage({ id: 'screen.patient.details.dob' });
    const organization = intl.formatMessage({ id: 'screen.patient.details.organization' });
    const firstName = intl.formatMessage({ id: 'screen.patient.details.firstName' });
    const lastName = intl.formatMessage({ id: 'screen.patient.details.lastName' });
    const gender = intl.formatMessage({ id: 'screen.patient.details.gender' });
    const pfamily = intl.formatMessage({ id: 'screen.patient.details.family' });
    const ethnicity = intl.formatMessage({ id: 'screen.patient.details.ethnicity' });
    const study = intl.formatMessage({ id: 'screen.patient.details.study' });
    const proband = intl.formatMessage({ id: 'screen.patient.details.proband' });
    const preferringPractitioner = intl.formatMessage({ id: 'screen.patient.details.referringPractitioner' });
    const mln = intl.formatMessage({ id: 'screen.patient.details.mln' });
    const id = intl.formatMessage({ id: 'screen.patient.details.id' });
    const practitioner = intl.formatMessage({ id: 'screen.patient.details.practitioner' });
    const date = intl.formatMessage({ id: 'screen.patient.details.date' });
    const ageAtConsultation = intl.formatMessage({ id: 'screen.patient.details.ageAtConsultation' });
    const type = intl.formatMessage({ id: 'screen.patient.details.type' });
    const author = intl.formatMessage({ id: 'screen.patient.details.author' });
    const specimen = intl.formatMessage({ id: 'screen.patient.details.specimen' });
    const consultation = intl.formatMessage({ id: 'screen.patient.details.consultation' });
    const status = intl.formatMessage({ id: 'screen.patient.details.status' });
    const request = intl.formatMessage({ id: 'screen.patient.details.request' });
    const barcode = intl.formatMessage({ id: 'screen.patient.details.barcode' });
    const code = intl.formatMessage({ id: 'screen.patient.details.code' });
    const term = intl.formatMessage({ id: 'screen.patient.details.term' });
    const notes = intl.formatMessage({ id: 'screen.patient.details.notes' });
    const mother = intl.formatMessage({ id: 'screen.patient.details.mother' });
    const father = intl.formatMessage({ id: 'screen.patient.details.father' });
    const familyId = intl.formatMessage({ id: 'screen.patient.details.familyId' });
    const configuration = intl.formatMessage({ id: 'screen.patient.details.configuration' });
    const dateAndTime = intl.formatMessage({ id: 'screen.patient.details.dateAndTime' });
    const ontology = intl.formatMessage({ id: 'screen.patient.details.ontology' });
    const observed = intl.formatMessage({ id: 'screen.patient.details.observed' });
    const apparition = intl.formatMessage({ id: 'screen.patient.details.apparition' });
    const identification = intl.formatMessage({ id: 'screen.patient.header.identification' });
    const additionalInformation = intl.formatMessage({ id: 'screen.patient.header.additionalInformation' });
    const referringPractitioner = intl.formatMessage({ id: 'screen.patient.header.referringPractitioner' });
    const geneticalConsultations = intl.formatMessage({ id: 'screen.patient.header.geneticalConsultations' });
    const requests = intl.formatMessage({ id: 'screen.patient.header.requests' });
    const samples = intl.formatMessage({ id: 'screen.patient.header.samples' });
    const clinicalSigns = intl.formatMessage({ id: 'screen.patient.header.clinicalSigns' });
    const indications = intl.formatMessage({ id: 'screen.patient.header.indications' });
    const generalObservations = intl.formatMessage({ id: 'screen.patient.header.generalObservations' });
    const family = intl.formatMessage({ id: 'screen.patient.header.family' });
    const familyHistory = intl.formatMessage({ id: 'screen.patient.header.familyHistory' });
    const generalInformation = intl.formatMessage({ id: 'screen.patient.header.generalInformation' });
    const familyMembers = intl.formatMessage({ id: 'screen.patient.header.familyMembers' });
    const patientTab = intl.formatMessage({ id: 'screen.patient.tab.patient' });
    const clinicalTab = intl.formatMessage({ id: 'screen.patient.tab.clinical' });
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
        <Navigation />
        <PatientNavigation
          intl={intl}
          patient={patient}
          search={search}
          navigateToPatientScreen={this.handleNavigationToPatientScreen}
          navigateToPatientSearchScreen={this.handleNavigationToPatientSearchScreen}
        />
        <Card className="entity">
          <PageHeader
            title={(
              <Typography.Title level={2}>
                {`${patient.details.firstName} ${patient.details.lastName}`}
              </Typography.Title>
            )}
            extra={`${dateOfBirth} : 2018-10-11`}
          />
          <Tabs key={patient.details.id} defaultActiveKey="patient">
            <Tabs.TabPane
              key="patient"
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
                      { label: proband, value: patient.details.proband },
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
                    { title: practitioner, dataIndex: 'practitioner', key: 'practitioner' },
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
                    { title: author, dataIndex: 'author', key: 'author' },
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
              key="clinique"
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
                      { title: ontology, dataIndex: 'ontologie', key: 'ontologie' },
                      { title: code, dataIndex: 'code', key: 'code' },
                      { title: term, dataIndex: 'term', key: 'term' },
                      { title: notes, dataIndex: 'note', key: 'note' },
                      { title: observed, dataIndex: 'observed', key: 'observed' },
                      { title: consultation, dataIndex: 'consultation', key: 'consultation' },
                      { title: apparition, dataIndex: 'date', key: 'date' },
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
                    { title: consultation, dataIndex: 'date', key: 'date' },
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
                    { title: consultation, dataIndex: 'date', key: 'date' },
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
                      { label: familyId, value: 'FA03939' },
                      { label: configuration, value: 'trio +' },
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
                  dataSource={patient.family.history}
                  size="small"
                  rowKey="date"
                />
              </Row>
            </Tabs.TabPane>
          </Tabs>
        </Card>
        <Footer />
      </Content>
    );
  }
}

PatientScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
  search: PropTypes.shape(searchShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    navigateToPatientScreen,
    navigateToPatientSearchScreen,
  }, dispatch),
});

const mapStateToProps = state => ({
  intl: state.intl,
  patient: state.patient,
  search: state.search,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(PatientScreen));
