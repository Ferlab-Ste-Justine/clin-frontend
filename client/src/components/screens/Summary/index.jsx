import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  Card, Col, Row, Layout, Radio, Icon, Empty, Button, Tabs, PageHeader, List,
} from 'antd';
import { Link } from 'react-router-dom';

import Content from '../../Content';
import Footer from '../../Footer';
import Header from '../../Header';

import './style.scss';

const SummaryScreen = ({ intl }) => ( // eslint-disable-line
  <Content>
    <Header />
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
        title="MRN:483726 - Sainte_justine"
        extra="Date de dernière modification : 30-10-2019 12:24"
      />

      <Card
        type="inner"
        title="Information Générale"
      >
        <List
          size="small"
          dataSource={[
            { label: 'Label 1', text: 'Text 1' },
            { label: 'Label 2', text: 'Text 2' },
            { label: 'Label 3', text: 'Text 3' },
            { label: 'Label 4', text: 'Text 4' },
            { label: 'Label 5', text: 'Text 5' },
          ]}
          renderItem={item => (
            <List.Item>
              {item.label}
              {' '}
              {item.text}
            </List.Item>
          )}
        />
      </Card>

      <Card
        type="inner"
        title="Soumission"
      >
        <List
          size="small"
          dataSource={[
            { label: 'Label 1', text: 'Text 1' },
            { label: 'Label 2', text: 'Text 2' },
            { label: 'Label 3', text: 'Text 3' },
            { label: 'Label 4', text: 'Text 4' },
            { label: 'Label 5', text: 'Text 5' },
          ]}
          renderItem={item => (
            <List.Item>
              {item.label}
              {' '}
              {item.text}
            </List.Item>
          )}
        />
      </Card>

      <Card
        type="inner"
        title="Famille"
      >
        <List
          size="small"
          dataSource={[
            { label: 'Label 1', text: 'Text 1' },
            { label: 'Label 2', text: 'Text 2' },
            { label: 'Label 3', text: 'Text 3' },
            { label: 'Label 4', text: 'Text 4' },
            { label: 'Label 5', text: 'Text 5' },
          ]}
          renderItem={item => (
            <List.Item>
              {item.label}
              {' '}
              {item.text}
            </List.Item>
          )}
        />
      </Card>

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
