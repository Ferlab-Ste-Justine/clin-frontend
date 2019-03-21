import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Content from '../../Content';
import LoginForm from '../../forms/Login';

import { loginUser, recoverUser } from '../../../actions/user';
import { appShape } from '../../../reducers/app';

import './style.scss';

const HomeScreen = ({ app, actions }) => {
  const { showLoadingAnimation } = app;
  return (
    <Content type="centered">
      <LoginForm
        appIsLoading={showLoadingAnimation}
        handleAuthentication={actions.loginUser}
        handlePasswordRecovery={actions.recoverUser}
      />
    </Content>
  );
};

HomeScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  app: PropTypes.shape(appShape).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    loginUser,
    recoverUser,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
});


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);
