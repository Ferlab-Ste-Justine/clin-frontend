import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card } from 'antd';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import LoginForm from '../../forms/Login';

import Query from '../../Query';


import { loginUser, recoverUser } from '../../../actions/user';
import { appShape } from '../../../reducers/app';

import './style.scss';

/* eslint-disable max-len */
const queryA = [
  { type: 'filter', options: { visible: true, checkable: true }, data: { category: 'study', type: 'string', value: ['My Study', 'Your Study'] } },
  { type: 'operator', options: { visible: true, editable: true }, data: { category: 'and', value: 'AND' } },
  { type: 'filter', options: { visible: true, checkable: true }, data: { category: 'proband', type: 'bool', value: ['true'] } },
];

const queryB = [
  { type: 'filter', options: { visible: true, checkable: true }, data: { category: 'study', type: 'string', value: ['My Study', 'Your Study'] } },
  { type: 'operator', options: { }, data: { category: 'or', value: 'OR' } },
  { type: 'filter', options: { visible: true, checkable: true }, data: { category: 'proband', type: 'bool', value: ['true'] } },
];

const queryC = [
  { type: 'filter', options: { visible: true, checkable: false, editable: true }, data: { category: 'study', type: 'string', value: ['My Study', 'Your Study'] } },
  { type: 'operator', options: { visible: true, editable: false }, data: { category: 'or', value: 'OR' } },
  { type: 'filter', options: { visible: true, checkable: false, editable: true }, data: { category: 'proband', type: 'bool', value: ['true'] } },
];

const HomeScreen = ({ app, intl, actions }) => { // eslint-disable-line
  const { showLoadingAnimation } = app;
  window.CLIN.translate = intl.formatMessage;
  return (
    <Content>
      <Header />
      <Navigation />
      <Card className="centered">

        <br />
        <div style={{ display: 'inline-grid', width: '100%' }}>
          <Query data={queryA} />
          <Query data={queryB} />
          <Query data={queryC} />
        </div>
        <br />
        <br />
        <br />
        <br />

        <LoginForm
          appIsLoading={showLoadingAnimation}
          handleAuthentication={actions.loginUser}
          handlePasswordRecovery={actions.recoverUser}
        />
      </Card>
      <Footer />
    </Content>
  );
};

HomeScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  app: PropTypes.shape(appShape).isRequired,
  intl: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    loginUser,
    recoverUser,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  intl: state.intl,
});


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(HomeScreen));
