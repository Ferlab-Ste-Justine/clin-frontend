/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { FormattedMessage } from 'react-intl';
import {
  Layout, Dropdown, Typography, Menu, Icon, Row, Col,
} from 'antd';

import { logoutUser } from '../actions/user';
import { userShape } from '../reducers/user';


const menu = actions => (
  <Menu>
    <Menu.Item key="submenu:logout" onClick={actions.logoutUser}>
      <span>
        <Icon type="logout" />
        {' '}
Logout
      </span>
    </Menu.Item>
  </Menu>
);

const Header = ({ actions, user }) => (
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
        <Dropdown overlay={menu(actions)}>
          <a className="ant-dropdown-link" href="#">
            <span className="ant-dropdown-link">
              <Icon type="user" />
              {` ${user.username} `}
              <Icon type="down" />
            </span>
          </a>
        </Dropdown>
      </Col>
    </Row>
  </Layout.Header>
);

Header.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  user: PropTypes.shape(userShape).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    logoutUser,
  }, dispatch),
});

const mapStateToProps = state => ({
  user: state.user,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Header);
