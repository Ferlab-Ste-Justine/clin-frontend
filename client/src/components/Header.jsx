/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FormattedMessage } from 'react-intl';
import {
  Layout, Dropdown, Typography, Menu, Icon, Row, Col,
} from 'antd';


const menu = (
  <Menu>
    <Menu.Item key="submenu:logout">
      <span>
        <Icon type="logout" />
        {' '}
Logout
      </span>
    </Menu.Item>
  </Menu>
);

const Header = () => (
  <Layout.Header id="header">
    <Row type="flex" justify="space-between">
      <Col span={6} align="start" style={{ marginTop: 9 }}>
        <Typography.Title style={{ color: 'white' }}>
          <span>
            <Icon type="code" />
            {' CLIN'}
          </span>
        </Typography.Title>
      </Col>
      <Col span={6} align="end">
        <Dropdown overlay={menu}>
          <a className="ant-dropdown-link" href="#">
            <span className="ant-dropdown-link">
              <Icon type="user" />
              {' user@clin.qc.ca '}
              <Icon type="down" />
            </span>
          </a>
        </Dropdown>
      </Col>
    </Row>
  </Layout.Header>
);

export default connect()(Header);
