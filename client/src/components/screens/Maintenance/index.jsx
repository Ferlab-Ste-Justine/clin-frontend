import React from 'react';
// import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Card } from 'antd';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';


const MaintenanceScreen = () => (
  <Content type="stretched-centered">
    <Header />
    <Navigation />
    <Card>
      <h1>Under Maintenance</h1>
    </Card>
    <Footer />
  </Content>
);

// MaintenanceScreen.propTypes = {};

export default injectIntl(MaintenanceScreen);
