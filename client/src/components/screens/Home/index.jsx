import React from 'react';
import { connect } from 'react-redux';

import Content from '../../Content';
import LoginForm from '../../forms/Login';

import './style.scss';

const HomeScreen = () => (
  <>
    <Content>
      <LoginForm handleLogin={() => {}} handleForgottenPassword={() => {}} />
    </Content>
  </>
);

export default connect()(HomeScreen);
