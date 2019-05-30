import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  Card, Col, Row, Layout, Radio, Icon, Empty, Button, Tabs, PageHeader, Typography,
} from 'antd';
import { Link } from 'react-router-dom';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';

import './style.scss';


const SummaryScreen = ({ intl }) => ( // eslint-disable-line
  <Content>
    <Header />
    <Navigation />
    <Layout.Content style={{ backgroundColor: '#B0C4DE', padding: 10, paddingBottom: 15 }}>
      <Row type="flex" justify="space-between" align="middle">
        <Col span={6} align="start">
          <Button>MRN:483726</Button>
        </Col>
        <Col span={10} align="center">
          <Radio.Group>
            <Radio.Button>
              <Link to="/summary/122">
                <Icon type="left" />
                {' '}
                  MRN:483726
              </Link>
            </Radio.Button>
            <Radio.Button disabled>Search Results 1 of 25</Radio.Button>
            <Radio.Button>
              <Link to="/summary/124">
                  MRN:483726
                <Icon type="right" />
              </Link>
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col span={6} align="end"><Link to="/list"><Button icon="left">Back to Search</Button></Link></Col>
      </Row>
    </Layout.Content>
    <Card>
      <PageHeader
        title={(<Typography.Title level={4}>MRN:483726 - Sainte_justine</Typography.Title>)}
        extra="Date de dernière modification : 30-10-2019 12:24"
      />
      <Row type="flex">
        <Col span={12}>
          <DataList
            title="Information Générale"
            dataSource={[
              { label: 'Label1', value: 'Content1' },
              { label: 'Label2', value: 'Content2' },
              { label: 'Label3', value: 'Content3' },
              { label: 'Label4', value: 'Content4' },
            ]}
          />
        </Col>
        <Col push={1} span={12}>
          <DataList
            title="Soumission"
            dataSource={[
              { label: 'Label1', value: 'Content1' },
              { label: 'Label2', value: 'Content2' },
              { label: 'Label3', value: 'Content3' },
              { label: 'Label4', value: 'Content4' },
            ]}
          />
        </Col>
        <Col span={11}>
          <br />
          <DataList
            title="Famille"
            dataSource={[
              { label: 'Label1', value: 'Content1' },
              { label: 'Label2', value: 'Content2' },
              { label: 'Label3', value: 'Content3' },
              { label: 'Label4', value: 'Content4' },
            ]}
          />
        </Col>
      </Row>
      <br />
      <br />
      <Tabs defaultActiveKey="patient" onChange={() => {}}>
        <Tabs.TabPane tab="Patient" key="patient"><Empty /></Tabs.TabPane>
        <Tabs.TabPane tab="Family" key="family"><Empty /></Tabs.TabPane>
      </Tabs>
    </Card>
    <Footer />
  </Content>
);

SummaryScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(SummaryScreen);
