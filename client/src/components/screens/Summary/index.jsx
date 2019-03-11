import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  Card, Col, Row, Layout, Radio, Icon, Empty, Button,
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
          <Button>123</Button>
        </Col>
        <Col span={10} align="center">
          <Radio.Group>
            <Radio.Button>
              <Link to="/summary/122">
                <Icon type="left" />
                {' '}
                    122
              </Link>
            </Radio.Button>
            <Radio.Button disabled>Listing 1 of 100</Radio.Button>
            <Radio.Button>
              <Link to="/summary/124">
124
                <Icon type="right" />
              </Link>
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col span={6} align="end"><Link to="/list"><Button icon="left">Back to Search</Button></Link></Col>
      </Row>
    </Layout.Content>

    <Card>
      <Empty />
    </Card>
    <Footer />
  </Content>
);

SummaryScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(SummaryScreen);
