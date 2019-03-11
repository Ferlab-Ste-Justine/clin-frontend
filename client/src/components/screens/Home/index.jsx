import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Content from '../../Content';
import LoginForm from '../../forms/Login';

import { authUser, userPasswordRecovery } from '../../../actions/user';

import './style.scss';


const HomeScreen = ({ actions }) => (
  <Content type="centered">
    <LoginForm handleAuthentication={actions.authUser} handlePasswordRecovery={actions.userPasswordRecovery} />
  </Content>
);

HomeScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    authUser,
    userPasswordRecovery,
  }, dispatch),
});

export default connect(
  () => ({}),
  mapDispatchToProps,
)(HomeScreen);
