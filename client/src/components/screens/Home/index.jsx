import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Content from '../../Content';
import LoginForm from '../../forms/Login';

import { loginUser, recoverUser } from '../../../actions/user';

import './style.scss';


const HomeScreen = ({ actions }) => (
  <Content type="centered">
    <LoginForm handleAuthentication={actions.loginUser} handlePasswordRecovery={actions.recoverUser} />
  </Content>
);

HomeScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    loginUser,
    recoverUser,
  }, dispatch),
});

export default connect(
  () => ({}),
  mapDispatchToProps,
)(HomeScreen);
