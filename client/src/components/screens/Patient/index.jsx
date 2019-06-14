/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Col, Row, Tabs, PageHeader, Typography, Table,
} from 'antd';

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
    const { intl, patient, search } = this.props;

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
    const preferringPractitioner = intl.formatMessage({ id: 'screen.patient.details.preferringPractitioner' });
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

    const ontologyResults = [{
      ontologie: 'HPO',
      code: 'HP:0003202',
      term: 'Skeletal muscle atrophy',
      notes: '',
      observed: 'Oui',
      consultation: '2019-12-01',
      apparition: '31-03-2019',
    },
    {
      ontologie: 'HPO',
      code: 'HP:0003202',
      term: 'Skeletal muscle atrophy',
      notes: '',
      observed: 'Oui',
      consultation: '2019-12-01',
      apparition: '31-03-2019',
    }];

    const geneticalConsultationResults = [
      {
        uid: 'CI930983',
        practitioner: 'Dr. Patrick DUJARDIN',
        age: '329 jours',
        date: '2019-02-12',
      },
    ];

    const requestResults = [
      {
        uid: 'SR000002',
        date: '2019-02-12',
        type: 'WXS',
        author: 'Julie GAUTHIER',
        specimen: 'SP000002',
        consulation: 'CI930983',
        status: 'completé',
      },
    ];

    const sampleResults = [
      {
        uid: 'SP000002',
        barcode: '38939eiku77',
        type: 'ADN',
        request: 'SR000002',
      },
    ];

    const indicationResults = [{
      notes: 'Suspicion d\'une mutation a transmission récessive qui atteint le tissus musculaire',
      consultation: '2019-12-01',
    }];

    const generalObservationResults = [{
      /* eslint-disable-next-line */
      notes: 'Le patient a été adressé par son medecin de famille apres une consultation datant de 2019-10-12 pour retard de l\'acquisition de la marche',
      consultation: '2019-12-01',
    }];

    const familyHistoryResults = [
      { notes: 'Mariage consanguin des parents (cousins)', datetime: '2019-02-12 13h00' },
      /* eslint-disable-next-line */
      { notes: 'Cas simillaire de cousin maternel (sans plus de précision sur l\'étiologie)', datetime: '2019-02-12 13h00' },
    ];

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
        <Card className="entity" style={{ height: '100%' }}>
          <PageHeader
            title={(<Typography.Title level={2}>Stéphane Bertrand</Typography.Title>)}
            extra={`${dateOfBirth} : 2018-10-11`}
          />
          <Tabs defaultActiveKey="patient">
            <Tabs.TabPane tab={patientTab} key="patient">
              <br />
              <Row type="flex" gutter="32">
                <Col span={12}>
                  <DataList
                    title={identification}
                    dataSource={[
                      { label: identifier, value: 'PT000001' },
                      { label: mrn, value: '4533941' },
                      { label: ramq, value: 'BERF18106921' },
                      { label: organization, value: 'CHUSJ' },
                      { label: firstName, value: 'Stéphane' },
                      { label: lastName, value: 'Bertrand' },
                      { label: dateOfBirth, value: '2018-10-11' },
                      { label: gender, value: 'Masculin' },
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <DataList
                    title={additionalInformation}
                    dataSource={[
                      { label: ethnicity, value: 'Canadien-Français' },
                      { label: pfamily, value: 'FA00393' },
                      { label: proband, value: 'Oui' },
                      { label: study, value: 'Rapidomics' },
                    ]}
                  />
                  <DataList
                    style={{ marginTop: '10px' }}
                    title={referringPractitioner}
                    dataSource={[
                      { label: preferringPractitioner, value: 'Dr. Patrick DUJARDIN' },
                      { label: mln, value: ' 000002516' },
                    ]}
                  />
                </Col>
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{geneticalConsultations}</Typography.Title>
                <Table
                  style={{ width: '100%' }}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: id, dataIndex: 'uid', key: 'uid' },
                    { title: practitioner, dataIndex: 'practitioner', key: 'practitioner' },
                    { title: date, dataIndex: 'date', key: 'date' },
                    { title: ageAtConsultation, dataIndex: 'age', key: 'age' },
                  ]}
                  dataSource={geneticalConsultationResults}
                />
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{requests}</Typography.Title>
                <Table
                  style={{ width: '100%' }}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: id, dataIndex: 'uid', key: 'uid' },
                    { title: date, dataIndex: 'date', key: 'date' },
                    { title: type, dataIndex: 'type', key: 'type' },
                    { title: author, dataIndex: 'author', key: 'author' },
                    { title: specimen, dataIndex: 'specimen', key: 'specimen' },
                    { title: consultation, dataIndex: 'consulation', key: 'consulation' },
                    { title: status, dataIndex: 'status', key: 'status' },
                  ]}
                  dataSource={requestResults}
                />
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{samples}</Typography.Title>
                <Table
                  style={{ width: '100%' }}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: id, dataIndex: 'uid', key: 'uid' },
                    { title: barcode, dataIndex: 'barcode', key: 'barcode' },
                    { title: type, dataIndex: 'type', key: 'type' },
                    { title: request, dataIndex: 'request', key: 'request' },
                  ]}
                  dataSource={sampleResults}
                />
              </Row>
            </Tabs.TabPane>
            <Tabs.TabPane tab={clinicalTab} key="clinique">
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{clinicalSigns}</Typography.Title>
                <Table
                  style={{ width: '100%' }}
                  pagination={false}
                  size="small"
                  columns={
                    [
                      { title: ontology, dataIndex: 'ontologie', key: 'ontologie' },
                      { title: code, dataIndex: 'code', key: 'code' },
                      { title: term, dataIndex: 'term', key: 'term' },
                      { title: notes, dataIndex: 'notes', key: 'notes' },
                      { title: observed, dataIndex: 'observed', key: 'observed' },
                      { title: consultation, dataIndex: 'consultation', key: 'consultation' },
                      { title: apparition, dataIndex: 'apparition', key: 'apparition' },
                    ]
                  }
                  dataSource={ontologyResults}
                />
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{indications}</Typography.Title>
                <Table
                  style={{ width: '100%' }}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: notes, dataIndex: 'notes', key: 'notes' },
                    { title: consultation, dataIndex: 'consultation', key: 'consultation' },
                  ]}
                  dataSource={indicationResults}
                />
              </Row>
              <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{generalObservations}</Typography.Title>
                <Table
                  style={{ width: '100%' }}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: notes, dataIndex: 'notes', key: 'notes' },
                    { title: consultation, dataIndex: 'consultation', key: 'consultation' },
                  ]}
                  dataSource={generalObservationResults}
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
              <Row type="flex" gutter="32">
                <Col span={12}>
                  <DataList
                    title={generalInformation}
                    dataSource={[
                      { label: familyId, value: 'FA03939' },
                      { label: configuration, value: 'trio +' },
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <DataList
                    title={familyMembers}
                    dataSource={[
                      { label: proband, value: 'PT000001' },
                      { label: father, value: 'PT000002' },
                      { label: mother, value: 'PT000003' },
                    ]}
                  />
                </Col>
              </Row>
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{familyHistory}</Typography.Title>
                <Table
                  style={{ width: '100%' }}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: notes, dataIndex: 'notes', key: 'notes' },
                    { title: dateAndTime, dataIndex: 'datetime', key: 'datetime' },
                  ]}
                  dataSource={familyHistoryResults}
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
