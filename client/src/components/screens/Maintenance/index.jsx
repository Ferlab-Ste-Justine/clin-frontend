import React from 'react';
// import PropTypes from 'prop-types';
import { Card } from 'antd';

import Navigation from '../../Navigation';

import './style.scss';
import Layout from '../../Layout';

const MaintenanceScreen = (error) => (
  <Layout>
    <>
      <Navigation />
      <Card>
        <h1>Under Maintenance</h1>
        <div style={{ display: 'none' }}>{ error }</div>
      </Card>
    </>
  </Layout>

);

// MaintenanceScreen.propTypes = {};

export default MaintenanceScreen;
