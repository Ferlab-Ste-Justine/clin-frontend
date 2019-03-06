import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';

import Header from '../Header';
import Content from '../Content';
import Footer from '../Footer';

import MyEnhancedForm from '../forms/Example';

const Example = () => (
  <>
    <Header />
    <Content>
      <Button type="primary"><FormattedMessage id="home.greeting" defaultMessage=" " /></Button>
      <MyEnhancedForm />
    </Content>
    <Footer />
  </>
);

export default connect()(Example);
