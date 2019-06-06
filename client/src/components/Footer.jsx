import React from 'react';
import { connect } from 'react-redux';
import { Layout, Row, Col } from 'antd';

const Footer = () => (
  <Layout.Footer id="footer">
    <Row type="flex" justify="space-between" align="middle">
      <Col align="start">
        <img height="20" alt="Centre universitaire de santé McGill" src="/images/mcgill.gif" />
      </Col>
      <Col align="center">
        <img height="45" alt="Centre hospitalier urbain de Montréal" src="/images/chum.png" />
      </Col>
      <Col align="center">
        <img height="40" alt="Hôpital général juif" src="/images/hgj.png" />
      </Col>
      <Col align="center">
        <img height="42" alt="CHU du Québec" src="/images/chu.png" />
      </Col>
      <Col align="center">
        <img height="40" alt="Hôpital Maisonneuve-Rosemont" src="/images/hmr.gif" />
      </Col>
      <Col align="center">
        <img height="35" alt="Institut de cardiologie de Montréal" src="/images/icm.png" />
      </Col>
      <Col align="end">
        <img height="50" alt="Centre hospitalier universitaire de Sherbrooke" src="/images/chus.gif" />
      </Col>
    </Row>
  </Layout.Footer>
);

export default connect()(Footer);
