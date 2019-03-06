import React from 'react';
import { connect } from 'react-redux';
// import { FormattedMessage } from 'react-intl';

import Content from '../../Content';

import LoginForm from '../../forms/Login';


import './style.scss';

const Home = () => (
  <>
    <Content>
      <LoginForm />
    </Content>
  </>
);

export default connect()(Home);
