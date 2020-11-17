import React from 'react';
import PropTypes from 'prop-types';
import { Layout as AntLayout } from 'antd';
import Footer from './Footer';
import Header from './Header';
import Content from './Content';
import './style.scss';

const Layout = ({ children }) => (
  <AntLayout>
    <Header />
    <AntLayout.Content>
      <Content>
        {children}
      </Content>
    </AntLayout.Content>
    <Footer />
  </AntLayout>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
