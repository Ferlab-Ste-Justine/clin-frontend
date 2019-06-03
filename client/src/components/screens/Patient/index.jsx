import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  Card, Col, Row, Layout, Radio, Icon, Empty, Button, Tabs, PageHeader, Typography, Table,
} from 'antd';
import { Link } from 'react-router-dom';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';

import './style.scss';


const SummaryScreen = ({ intl }) => ( // eslint-disable-line
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
              <Link to="/patient/483727">
                  MRN:483727
                <Icon type="right" />
              </Link>
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col span={6} align="end"><Link to="/patient/search"><Button type="primary" icon="left">Back to Search</Button></Link></Col>
      </Row>
    </Layout.Content>
    <Card className="entity" style={{ height: '100%' }}>
      <PageHeader
        title={(<Typography.Title level={2}>Stéphane BERTRAND</Typography.Title>)}
        extra="Date de naissance : 2018-10-11"
      />
      <Tabs defaultActiveKey="patient" onChange={() => {}}>
        <Tabs.TabPane tab="Patient" key="patient">
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
          <br />
          <Row type="flex">
            <Typography.Title level={4}>
                Consultation(s) génétique(s)
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
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
          <Row type="flex">
            <Typography.Title level={4}>
                Requête(s)
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
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
          <Row type="flex">
            <Typography.Title level={4}>
                Échantillon(s)
            </Typography.Title>
            <Table
              style={{ width: '100%' }}
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
          <Card>
            <Empty />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </Card>
    <Footer />
  </Content>
);

SummaryScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(SummaryScreen);
