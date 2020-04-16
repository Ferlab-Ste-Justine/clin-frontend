import React from 'react';
// import PropTypes from 'prop-types';
import { Card } from 'antd';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';


const MaintenanceScreen = error => (
  <Content type="stretched-centered">
    <Header />
    <Navigation />
    <Card>
      <h1>Under Maintenance</h1>
      <div style={{ display: 'none' }}>{error}</div>
    </Card>
    <Footer />
  </Content>
);

// MaintenanceScreen.propTypes = {};

export default MaintenanceScreen;
