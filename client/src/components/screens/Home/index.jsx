/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card } from 'antd';
import { cloneDeep } from 'lodash';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import LoginForm from '../../forms/Login';

import Statement from '../../Query/Statement';

import { loginUser, recoverUser } from '../../../actions/user';
import { appShape } from '../../../reducers/app';

import './style.scss';

/* eslint-disable max-len */
const queryA = {
  title: 'Query 1',
  instructions: [
    {
      type: 'filter',
      data: {
        id: 'study',
        type: 'generic',
        operand: 'all',
        values: ['My Study', 'Your Study'],
      },
    },
    {
      type: 'operator',
      data: {
        type: 'and',
      },
    },
    {
      type: 'filter',
      data: {
        id: 'proband',
        type: 'generic',
        operand: 'one',
        values: ['true'],
      },
    },
    {
      type: 'operator',
      data: {
        type: 'and',
      },
    },
    {
      type: 'filter',
      data: {
        id: 'study',
        type: 'generic',
        operator: 'all',
        values: ['My Study', 'Your Study'],
      },
    },
    {
      type: 'operator',
      data: {
        type: 'and',
      },
    },
    {
      type: 'filter',
      data: {
        id: 'proband',
        type: 'generic',
        operand: 'one',
        values: ['true'],
      },
    },
  ],
};

const queryB = {
  instructions: [
    {
      type: 'filter',
      data: {
        id: 'study',
        type: 'generic',
        operand: 'none',
        values: ['My Study'],
      },
    },
    {
      type: 'operator',
      data: {
        type: 'or',
      },
    },
    {
      type: 'filter',
      data: {
        id: 'proband',
        type: 'generic',
        operand: 'all',
        values: ['true'],
      },
    },
  ],
};

const optionsA = {
  copyable: true,
  duplicatable: true,
  editable: true,
  removable: true,
  reorderable: true,
  selectable: true,
  undoable: true,
};
const statementA = [
  queryA,
  queryB,
  cloneDeep(queryA),
  cloneDeep(queryA),
];
const displayA = {
  compoundOperators: true,
};

/*
  <Query key="query1" data={queryA} />
  <br />
  <Query key="query2" data={queryB} />
  <br />
  <br />
  <br />
  <br />
  <br />
*/

const HomeScreen = ({ app, intl, actions }) => { // eslint-disable-line
  const { showLoadingAnimation } = app;
  window.CLIN.translate = intl.formatMessage;
  return (
    <Content>
      <Header />
      <Navigation />
      <Card className="centered">

        <br />
        <div style={{ width: 850 }}>
          <Statement key="test-statement" data={statementA} options={optionsA} display={displayA} />
        </div>
        <br />

        {/*
        <LoginForm
          appIsLoading={showLoadingAnimation}
          handleAuthentication={actions.loginUser}
          handlePasswordRecovery={actions.recoverUser}
        />
        */}

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
