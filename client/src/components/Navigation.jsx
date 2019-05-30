import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout, Row, Col, Dropdown, Menu, Icon,
} from 'antd';

import { appShape } from '../reducers/app';
import { changeLanguage } from '../actions/app';
import { userShape } from '../reducers/user';
import { logoutUser } from '../actions/user';


const navigationMenu = () => (
  <Menu />
);

const userMenu = (intl, actions) => {
  const logout = intl.formatMessage({ id: 'navigation.logout' });

  return (
    <Menu>
      <Menu.Item key="logout" onClick={actions.logoutUser}>
        <span>
          <Icon type="logout" />
          {` ${logout}`}
        </span>
      </Menu.Item>
    </Menu>
  );
};

const languageMenu = (intl, actions) => {
  const langFr = intl.formatMessage({ id: 'lang.fr.long' });
  const langEn = intl.formatMessage({ id: 'lang.en.long' });

  return (
    <Menu>
      <Menu.Item
        onClick={() => {
          actions.changeLanguage('fr');
        }}
      >
        <span>
          {langFr}
        </span>
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          actions.changeLanguage('en');
        }}
      >
        <span>
          {langEn}
        </span>
      </Menu.Item>
    </Menu>
  );
};

const Navigation = ({
  app, intl, user, actions,
}) => (
  <Layout.Content id="navigation">
    <Row type="flex" justify="space-between" align="middle">
      <Col span={16} align="start">
        { user.username !== null && navigationMenu(intl, actions)}
      </Col>
      <Col span={4}>
        {user.username !== null && (
          <Dropdown overlay={userMenu(intl, actions)}>
            { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="ant-dropdown-link">
              <span className="ant-dropdown-link">
                <Icon type="user" />
                {` ${user.username} `}
                <Icon type="down" />
              </span>
            </a>
          </Dropdown>
        )}
      </Col>
      <Col span={4} align="end">
        {app.locale.lang !== null && (
          <Dropdown overlay={languageMenu(intl, actions)}>
            { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="ant-dropdown-link">
              <span className="ant-dropdown-link">
                <Icon type="language" />
                {` ${intl.formatMessage({ id: `lang.${app.locale.lang}.long` })} `}
                <Icon type="down" />
              </span>
            </a>
          </Dropdown>
        )}
      </Col>
    </Row>
  </Layout.Content>
);

Navigation.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  app: PropTypes.shape(appShape).isRequired,
  intl: PropTypes.shape({}).isRequired,
  user: PropTypes.shape(userShape).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    logoutUser,
    changeLanguage,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  intl: state.intl,
  user: state.user,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(Navigation));
