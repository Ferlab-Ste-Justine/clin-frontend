import React from 'react';
import { connect } from 'react-redux';
import { Layout } from 'antd';

const Footer = () => (
  <Layout.Footer id="footer">
    Hello. I am the footer.
  </Layout.Footer>
);

export default connect()(Footer);
