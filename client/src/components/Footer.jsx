import React from 'react';
import { connect } from 'react-redux';
import { Layout, Row, Col } from 'antd';

const Footer = () => (
  <Layout.Footer id="footer">
    <Row type="flex" justify="space-between">
      <Col align="start">
        {/* eslint-ignore-next-line max-len */}
        <img alt="Centre universitaire de santé McGill" src="https://dummyimage.com/100x45/FFFFFF/000000.png&text=[+LOGO+MCGILL+]" />
      </Col>
      <Col align="center">
        {/* eslint-ignore-next-line max-len */}
        <img alt="Centre hospitalier urbain de Montréal" src="https://dummyimage.com/100x45/FFFFFF/000000.png&text=[+LOGO+CHUM+]" />
      </Col>
      <Col align="center">
        {/* eslint-ignore-next-line max-len */}
        <img alt="Hôpital général juif" src="https://dummyimage.com/100x45/FFFFFF/000000.png&text=[+LOGO+HGJ+]" />
      </Col>
      <Col align="center">
        {/* eslint-ignore-next-line max-len */}
        <img alt="CHU du Québec" src="https://dummyimage.com/100x45/FFFFFF/000000.png&text=[+LOGO+CHUQ+]" />
      </Col>
      <Col align="center">
        {/* eslint-ignore-next-line max-len */}
        <img alt="Hôpital Maisonneuve-Rosement" src="https://dummyimage.com/100x45/FFFFFF/000000.png&text=[+LOGO+HMR+]" />
      </Col>
      <Col align="center">
        {/* eslint-ignore-next-line max-len */}
        <img alt="Institut de cardiologie de Montréal" src="https://dummyimage.com/100x45/FFFFFF/000000.png&text=[+LOGO+ICM+]" />
      </Col>
      <Col align="end">
        {/* eslint-ignore-next-line max-len */}
        <img alt="Centre hospitalier universitaire de Sherbrooke" src="https://dummyimage.com/100x45/FFFFFF/000000.png&text=[+LOGO+CHUS+]" />
      </Col>
    </Row>
  </Layout.Footer>
);

export default connect()(Footer);
