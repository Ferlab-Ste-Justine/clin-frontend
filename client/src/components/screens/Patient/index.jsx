import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Col, Row, Layout, Radio, Icon, Button, Tabs, PageHeader, Typography, Table,
} from 'antd';
import { Link } from 'react-router-dom';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';

import './style.scss';
import { patientShape } from '../../../reducers/patient';
import { searchShape } from '../../../reducers/search';

import { navigateToPatientScreen } from '../../../actions/router';


const PatientScreen = ({ intl, patient, search, actions }) => ( // eslint-disable-line
  <Content type="auto">
    <Header />
    <Navigation />
    <Layout.Content style={{ padding: 10, paddingBottom: 15 }}>
      <Row type="flex" justify="space-between" align="middle">
        <Col span={6} align="start">
          <Button disabled style={{ color: '#000000', fontWeight: 'bold' }}>MRN:483725</Button>
        </Col>
        <Col span={10} align="center">
          <Radio.Group>
            <Radio.Button>
              <Link to="/patient/483726">
                <Icon type="left" />
                {' '}
                  MRN:483726
              </Link>
            </Radio.Button>
            <Radio.Button disabled style={{ color: '#000000' }}>Search Results 1 of 25</Radio.Button>
            <Radio.Button>
              <button type="button" onClick={actions.navigateToPatientScreen.apply('PA000011')}>
                  MRN:483727
                <Icon type="right" />
              </button>
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col span={6} align="end">
          <Link to="/patient/search">
            <Button type="primary" icon="left">
            Back to Search
            </Button>
          </Link>
        </Col>
      </Row>
    </Layout.Content>
    <Card className="entity" style={{ height: '100%' }}>
      <PageHeader
        title={(<Typography.Title level={2}>Stéphane BERTRAND</Typography.Title>)}
        extra="Date de naissance : 2018-10-11"
      />
      <Tabs defaultActiveKey="patient" onChange={() => {}}>
        <Tabs.TabPane tab="Patient" key="patient">
          <br />
          <Row type="flex" gutter="32">
            <Col span={12}>
              <DataList
                title="Identification"
                dataSource={[
                  { label: 'Identifiant', value: 'PT000001' },
                  { label: 'MRN', value: '4533941' },
                  { label: 'RAMQ', value: 'BERF18106921' },
                  { label: 'Organisation', value: 'CHUSJ' },
                  { label: 'Prénom', value: 'Stéphane' },
                  { label: 'Nom', value: 'Bertrand' },
                  { label: 'Date de naissance', value: '2018-10-11' },
                  { label: 'Sexe', value: 'Masculin' },
                ]}
              />
            </Col>
            <Col span={12}>
              <DataList
                title="Informations additionnelles"
                dataSource={[
                  { label: 'Ethnicité', value: 'Canadien-Français' },
                  { label: 'Famille', value: 'FA00393' },
                  { label: 'Label3', value: 'Oui' },
                  { label: 'Étude', value: 'Rapidomics' },
                ]}
              />
              <DataList
                style={{ marginTop: '10px' }}
                title="Médecin référent"
                dataSource={[
                  { label: 'Médecin référent', value: 'Dr. Patrick DUJARDIN' },
                  { label: 'MLN', value: ' 000002516' },
                ]}
              />
            </Col>
          </Row>
          <br />
          <br />
          <Row type="flex">
            <Typography.Title level={4}>
                Consultation(s) génétique(s)
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
              pagination={false}
              size="small"
              dataSource={[{
                uid: 'CI930983',
                practitioner: 'Dr. Patrick DUJARDIN',
                age: '329 jours',
                date: '2019-02-12,',
              }]}
              columns={[{
                title: 'Identifiant',
                dataIndex: 'uid',
                key: 'uid',
              },
              {
                title: 'Médecin',
                dataIndex: 'practitioner',
                key: 'practitioner',
              },
              {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
              },
              {
                title: 'Age du patient à la consultation',
                dataIndex: 'age',
                key: 'age',
              }]}
            />
          </Row>
          <br />
          <br />
          <Row type="flex">
            <Typography.Title level={4}>
                Requête(s)
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
              pagination={false}
              size="small"
              dataSource={[{
                uid: 'SR000002',
                date: '2019-02-12',
                type: 'WXS',
                author: 'Julie GAUTHIER',
                specimen: 'SP000002',
                consulation: 'CI930983',
                status: 'completé',
              }]}
              columns={[{
                title: 'ID',
                dataIndex: 'uid',
                key: 'uid',
              },
              {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
              },
              {
                title: 'Auteur',
                dataIndex: 'author',
                key: 'author',
              },
              {
                title: 'Spécimen',
                dataIndex: 'specimen',
                key: 'specimen',
              },


              {
                title: 'Consultation',
                dataIndex: 'consulation',
                key: 'consulation',
              },

              {
                title: 'Statut',
                dataIndex: 'status',
                key: 'status',
              },
              ]}
            />
          </Row>
          <br />
          <br />
          <Row type="flex">
            <Typography.Title level={4}>
                Échantillon(s)
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
              pagination={false}
              size="small"
              dataSource={[{
                uid: 'SP000002',
                barcode: '38939eiku77',
                type: 'ADN',
                request: 'SR000002',
              }]}
              columns={[{
                title: 'ID',
                dataIndex: 'uid',
                key: 'uid',
              },
              {
                title: 'Code barre',
                dataIndex: 'barcode',
                key: 'barcode',
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
              },
              {
                title: 'Requête',
                dataIndex: 'request',
                key: 'request',
              }]}
            />
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Clinique" key="clinique">
          <br />
          <Row type="flex">
            <Typography.Title level={4}>
                Signe(s) clinique(s)
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
              pagination={false}
              size="small"
              dataSource={[{
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
              }]}
              columns={[{
                title: 'Ontologie',
                dataIndex: 'ontologie',
                key: 'ontologie',
              },
              {
                title: 'Code',
                dataIndex: 'code',
                key: 'code',
              },
              {
                title: 'Terme',
                dataIndex: 'term',
                key: 'term',
              },
              {
                title: 'Notes',
                dataIndex: 'notes',
                key: 'notes',
              },

              {
                title: 'Observé',
                dataIndex: 'observed',
                key: 'observed',
              },
              {
                title: 'Consultation',
                dataIndex: 'consultation',
                key: 'consultation',
              },
              {
                title: 'Apparition',
                dataIndex: 'apparition',
                key: 'apparition',
              },

              ]}
            />
          </Row>
          <br />
          <br />
          <Row type="flex">
            <Typography.Title level={4}>
                Indication(s)
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
              pagination={false}
              size="small"
              dataSource={[{
                notes: 'Suspicion d\'une mutation a transmission récessive qui atteint le tissus musculaire',
                consultation: '2019-12-01',
              }]}
              columns={[{
                title: 'Notes',
                dataIndex: 'notes',
                key: 'notes',
              },
              {
                title: 'Consultation',
                dataIndex: 'consultation',
                key: 'consultation',
              }]}
            />
          </Row>
          <br />
          <br />
          <Row type="flex">
            <Typography.Title level={4}>
              Observation(s) générale(s)
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
              pagination={false}
              size="small"
              dataSource={[{
                /* eslint-disable-next-line */
                notes: 'Le patient a été adressé par son medecin de famille apres une consultation datant de 2019-10-12 pour retard de l\'acquisition de la marche',
                consultation: '2019-12-01',
              }]}
              columns={[{
                title: 'Notes',
                dataIndex: 'notes',
                key: 'notes',
              },
              {
                title: 'Consultation',
                dataIndex: 'consultation',
                key: 'consultation',
              }]}
            />
          </Row>
          <br />
          <br />
          <Row type="flex">
            <br />
            <Col span={24}>
              <Typography.Title level={4}>
                  Famille
              </Typography.Title>
            </Col>
          </Row>
          <Row type="flex" gutter="32">
            <Col span={12}>
              <DataList
                title="Informations générales"
                dataSource={[
                  { label: 'ID Famille', value: 'FA03939' },
                  { label: 'Configuration', value: 'trio +' },
                ]}
              />
            </Col>
            <Col span={12}>
              <DataList
                title="Membres de la famille"
                dataSource={[
                  { label: 'Proband', value: 'PT000001' },
                  { label: 'Père', value: 'PT000002' },
                  { label: 'Mère', value: 'PT000003' },
                ]}
              />
            </Col>
          </Row>
          <br />
          <Row type="flex">
            <Typography.Title level={4}>
              Histoire familiale
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
              pagination={false}
              size="small"
              dataSource={[{
                notes: 'Mariage consanguin des parents (cousins)',
                datetime: '2019-02-12 13h00',
              }, {
                notes: 'Cas simillaire de cousin maternel (sans plus de précision sur l\'étiologie)',
                datetime: '2019-02-12 13h00',
              }]}
              columns={[{
                title: 'Notes',
                dataIndex: 'notes',
                key: 'notes',
              },
              {
                title: 'Date et heure',
                dataIndex: 'datetime',
                key: 'datetime',
              }]}
            />
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </Card>
    <Footer />
  </Content>
);

PatientScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
  search: PropTypes.shape(searchShape).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    navigateToPatientScreen,
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
