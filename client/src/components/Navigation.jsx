import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Row, Col, Dropdown, Menu, Icon, Tabs,
} from 'antd';

import { appShape } from '../reducers/app';
import { changeLanguage } from '../actions/app';
import { userShape } from '../reducers/user';
import { logoutUser } from '../actions/user';
import { navigateToPatientSearchScreen, navigate } from '../actions/router';


/*eslint-disable*/
// onClick={navigateToPatientSearchScreen}
const navigationMenu = (intl, router, actions) => {
  const patientSearch = intl.formatMessage({ id: 'navigation.main.searchPatient' });
  let tabForRoute = router.location.pathname;
  if (tabForRoute.indexOf('/patient/') !== -1) {
    tabForRoute = '/patient/search';
  }
  return (
    <Tabs type="card" activeKey={tabForRoute} style={{ top: -9 }} onChange={(activeKey)=> {
        if (activeKey === '/patient/search') {
          actions.navigateToPatientSearchScreen();
        } else {
          actions.navigate(activeKey)
        }
      }}
    >
      <Tabs.TabPane tab={patientSearch} key="/patient/search" />
      <Tabs.TabPane tab="Recherche de Variants" key="/variant/search" />
    </Tabs>
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
  <nav id="navigation" style={{ position: 'relative', height: 42 }}>
    <Row type="flex" justify="space-between">
      <Col span={16} align="start">
        { user.username !== null && navigationMenu(intl, router, actions)}
      </Col>
      <Col span={8} align="end">
        {user.username !== null && (
        <Dropdown overlay={userMenu(intl, actions)}>
          { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="ant-dropdown-link" style={{ paddingRight: '25px' }}>
            <Icon type="user" />
            {` ${user.username} `}
            <Icon type="down" />
          </a>
        </Dropdown>
        )}
        {app.locale.lang !== null && (
        <Dropdown overlay={languageMenu(intl, actions)}>
          { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="ant-dropdown-link">
            <Icon type="flag" />
            {` ${intl.formatMessage({ id: `lang.${app.locale.lang}.long` })} `}
            <Icon type="down" />
          </a>
        </Dropdown>
        )}
      </Col>
    </Row>
  </nav>
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
    navigateToPatientSearchScreen,
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
