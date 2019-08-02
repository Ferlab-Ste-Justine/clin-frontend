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

import Query from '../../Query/index';


import { loginUser, recoverUser } from '../../../actions/user';
import { appShape } from '../../../reducers/app';

import './style.scss';

/* eslint-disable max-len */
const queryA = [
  {
    type: 'filter',
    options: {
      selectable: true,
      editable: true,
    },
    data: {
      id: 'study',
      title: 'Study',
      type: 'generic',
      operator: 'all',
      values: ['My Study', 'Your Study'],
    },
  },
  {
    type: 'operator',
    options: {
      selectable: false,
      editable: true,
    },
    data: {
      type: 'and',
    },
  },
  {
    type: 'filter',
    options: {
      selectable: false,
      editable: false,
    },
    data: {
      id: 'proband',
      title: 'Proband',
      type: 'generic',
      operator: 'one',
      values: ['true'],
    },
  },
  {
    type: 'operator',
    options: {
      selectable: false,
      editable: true,
    },
    data: {
      type: 'and',
    },
  },
  {
    type: 'subquery',
    options: {
      selectable: true,
      editable: true,
    },
    data: {
      type: 'generic',
    },
  },
];

const queryB = [
  {
    type: 'filter',
    options: {
      selectable: true,
      editable: true,
    },
    data: {
      id: 'study',
      title: 'Study',
      type: 'generic',
      operator: 'none',
      values: ['My Study'],
    },
  },
  {
    type: 'operator',
    options: {
      selectable: false,
      editable: true,
    },
    data: {
      type: 'or',
    },
  },
  {
    type: 'filter',
    options: {
      selectable: true,
      editable: true,
    },
    data: {
      id: 'proband',
      title: 'Proband',
      type: 'generic',
      operator: 'all',
      values: ['true'],
    },
  },
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
        <Query key="query1" data={queryA} />
        <br />
        <Query key="query2" data={queryB} />
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
