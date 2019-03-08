import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Layout } from 'antd';

const Header = () => (
  <Layout.Header id="header">
    <FormattedMessage id="nav.home" defaultMessage=" " />
  </Layout.Header>
);

export default connect()(Header);
