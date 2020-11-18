/* eslint-disable camelcase, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Layout, Row, Col, Dropdown, Menu, Icon, Divider,
} from 'antd';
import IconKit from 'react-icons-kit';
import { ic_translate, ic_account_circle, ic_supervisor_account } from 'react-icons-kit/md';
import { logoutUser } from '../../actions/user';
import { changeLanguage } from '../../actions/app';
import { navigateToPatientSearchScreen } from '../../actions/router';
import { appShape } from '../../reducers/app';
import { userShape } from '../../reducers/user';


const userMenu = actions => (
  <Menu>
    <Menu.Item key="logout" onClick={actions.logoutUser}>
      <span>
        <Icon type="logout" />
        { ` ${intl.get('header.navigation.user.logout')}` }
      </span>
    </Menu.Item>
  </Menu>
);

const languageMenu = actions => (
  <Menu>
    <Menu.Item
      onClick={() => {
        actions.changeLanguage('fr');
      }}
    >
      <span>
        { intl.get('lang.fr.long') }
      </span>
    </Menu.Item>


    <Menu.Item
      onClick={() => {
        actions.changeLanguage('en');
      }}
    >
      <span>
        { intl.get('lang.en.long') }
      </span>
    </Menu.Item>
  </Menu>
);


const Header = ({
  user, app, actions,
}) => {
  const lang = intl.options.currentLocale;
  const title = intl.get('header.title');
  const langText = intl.get(`lang.${lang}.short`);
  return (
    <Layout.Header id="header">
      <Row type="flex" justify="space-between" align="middle">
        <Col>
          <img className="logo" alt={title} src="/assets/logos/cqgc-white.svg" />
        </Col>
        <div className="secondaryNav">
          { user.username !== null && (
          <>
            <div className="navigation">
              <Row type="flex" justify="space-between" align="middle">
                <Col className="patientList">
                  { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
                  <a onClick={actions.navigateToPatientSearchScreen} className="ant-dropdown-link">
                    <IconKit size={16} icon={ic_supervisor_account} />
                    { intl.get('header.navigation.patient') }
                  </a>
                </Col>
                <Divider type="vertical" />
              </Row>
            </div>
            <Col className="userName">
              <Dropdown overlay={userMenu(actions)} trigger={['click']}>
                { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
                <a className="ant-dropdown-link">
                  <IconKit size={16} icon={ic_account_circle} />
                  { ` ${user.firstName} ` }
                </a>
              </Dropdown>
            </Col>
          </>
          ) }
          <Col>
            { app.locale.lang !== null && (
              <Dropdown overlay={languageMenu(actions)} trigger={['click']}>
                { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
                <a className="ant-dropdown-link">
                  <IconKit size={16} icon={ic_translate} />
                  { langText }
                </a>
              </Dropdown>
            ) }
          </Col>
        </div>

      </Row>
    </Layout.Header>
  );
};

Header.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  user: PropTypes.shape(userShape).isRequired,
  app: PropTypes.shape(appShape).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    logoutUser,
    changeLanguage,
    navigateToPatientSearchScreen,
  }, dispatch),
});

const mapStateToProps = state => ({
  user: state.user,
  app: state.app,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Header);
