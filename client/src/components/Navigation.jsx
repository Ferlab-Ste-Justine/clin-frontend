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
import navigate from '../actions/router';


const navigationMenu = (intl, router, actions) => {
  const patientSearch = intl.formatMessage({ id: 'navigation.main.searchPatient' });
  return (
    <Menu onClick={(e) => { actions.navigate(e.key); }} mode="horizontal" selectedKeys={[router.location.pathname]}>
      <Menu.Item key="/patient/search">
        <Icon type="search" />
        {patientSearch}
      </Menu.Item>
    </Menu>
  );
};

const userMenu = (intl, actions) => {
  const logout = intl.formatMessage({ id: 'navigation.user.logout' });

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
  app, intl, user, router, actions,
}) => (
  <Layout.Content id="navigation">
    <Row type="flex" justify="space-between" align="middle">
      <Col span={16} align="start">
        { user.username !== null && navigationMenu(intl, router, actions)}
      </Col>
      <Col span={8} align="end">
        {user.username !== null && (
          <Dropdown overlay={userMenu(intl, actions)}>
            { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="ant-dropdown-link" style={{ paddingRight: '25px' }}>
              <span className="ant-dropdown-link">
                <Icon type="user" />
                {` ${user.username} `}
                <Icon type="down" />
              </span>
            </a>
          </Dropdown>
        )}
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
  router: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    logoutUser,
    changeLanguage,
    navigate,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  intl: state.intl,
  user: state.user,
  router: state.router,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(Navigation));
