import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Layout, Row, Col, Dropdown, Menu, Icon,
} from 'antd';
import { Desktop, Tablet } from '../containers/Responsive';
import { logoutUser } from '../actions/user';
import { changeLanguage } from '../actions/app';
import { appShape } from '../reducers/app';
import { userShape } from '../reducers/user';


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


const Header = ({
  intl, user, app, actions,
}) => {
  const title = intl.formatMessage({ id: 'header.title' });
  return (
    <Layout.Header id="header">
      <Row type="flex">
        <Col span={16}>
          <img width="90%" alt={title} src="/images/cqgc.jpg" />
        </Col>
        <Col span={5} align="end">
          {user.username !== null && (
            <Dropdown overlay={userMenu(intl, actions)}>
              { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a className="ant-dropdown-link">
                <Desktop><Icon type="user" /></Desktop>
                {` ${user.firstName} `}
                <Desktop><Icon type="down" /></Desktop>
                <Tablet><Icon type="down" /></Tablet>
              </a>
            </Dropdown>
          )}
        </Col>
        <Col span={3} align="end">
          {app.locale.lang !== null && (
            <Dropdown overlay={languageMenu(intl, actions)}>
              { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a className="ant-dropdown-link">
                <Desktop><Icon type="flag" /></Desktop>
                {` ${intl.formatMessage({ id: `lang.${app.locale.lang}.long` })} `}
                <Desktop><Icon type="down" /></Desktop>
                <Tablet><Icon type="down" /></Tablet>
              </a>
            </Dropdown>
          )}
        </Col>


      </Row>
    </Layout.Header>
  );
};

Header.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  intl: PropTypes.shape({}).isRequired,
  user: PropTypes.shape(userShape).isRequired,
  app: PropTypes.shape(appShape).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    logoutUser,
    changeLanguage,
  }, dispatch),
});

const mapStateToProps = state => ({
  intl: state.intl,
  user: state.user,
  app: state.app,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(Header));
