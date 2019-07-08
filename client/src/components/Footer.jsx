import React from 'react';
import { connect } from 'react-redux';
import {
  Layout, Row, Col, BackTop, Icon,
} from 'antd';
import { Mobile, Tablet, Desktop } from '../containers/Responsive';

const Footer = () => (
  <Layout.Footer id="footer">
    <Row type="flex" justify="space-between" align="middle">
      <Desktop>
        <Col span={3} align="start">
          <img height="25" alt="Centre universitaire de santé McGill" src="/images/mcgill.gif" />
        </Col>
        <Col span={3} align="center">
          <img height="45" alt="Centre hospitalier urbain de Montréal" src="/images/chum.png" />
        </Col>
        <Col span={3} align="center">
          <img height="45" alt="Hôpital général juif" src="/images/hgj.png" />
        </Col>
        <Col span={3} align="center">
          <img height="42" alt="CHU du Québec" src="/images/chu.png" />
        </Col>
        <Col span={3} align="center">
          <img height="40" alt="Hôpital Maisonneuve-Rosemont" src="/images/hmr.gif" />
        </Col>
        <Col span={3} align="center">
          <img height="35" alt="Institut de cardiologie de Montréal" src="/images/icm.png" />
        </Col>
        <Col span={3} align="end">
          <img height="50" alt="Centre hospitalier universitaire de Sherbrooke" src="/images/chus.gif" />
        </Col>
      </Desktop>
      <Tablet>
        <Col span={3} align="start">
          <img height="25" alt="Centre universitaire de santé McGill" src="/images/mcgill.gif" />
        </Col>
        <Col span={3} align="center">
          <img height="45" alt="Centre hospitalier urbain de Montréal" src="/images/chum.png" />
        </Col>
        <Col span={3} align="center">
          <img height="45" alt="Hôpital général juif" src="/images/hgj.png" />
        </Col>
        <Col span={3} align="center">
          <img height="42" alt="CHU du Québec" src="/images/chu.png" />
        </Col>
        <Col span={3} align="start">
          <img height="40" alt="Hôpital Maisonneuve-Rosemont" src="/images/hmr.gif" />
        </Col>
        <Col span={3} align="center">
          <img height="30" alt="Institut de cardiologie de Montréal" src="/images/icm.png" />
        </Col>
        <Col span={3} align="end">
          <img height="50" alt="Centre hospitalier universitaire de Sherbrooke" src="/images/chus.gif" />
        </Col>
      </Tablet>
      <Mobile>
        <Col span={4} align="start">
          <img height="20" alt="Centre universitaire de santé McGill" src="/images/mcgill.gif" />
        </Col>
        <Col span={2} align="center">
          <img height="40" alt="Centre hospitalier urbain de Montréal" src="/images/chum.png" />
        </Col>
        <Col span={4} align="center">
          <img height="40" alt="Hôpital général juif" src="/images/hgj.png" />
        </Col>
        <Col span={2} align="center">
          <img height="42" alt="CHU du Québec" src="/images/chu.png" />
        </Col>
        <Col span={3} align="end">
          <img height="40" alt="Hôpital Maisonneuve-Rosemont" src="/images/hmr.gif" />
        </Col>
        <Col span={5} align="end">
          <img height="30" alt="Institut de cardiologie de Montréal" src="/images/icm.png" />
        </Col>
        <Col span={4} align="end">
          <img height="50" alt="Centre hospitalier universitaire de Sherbrooke" src="/images/chus.gif" />
        </Col>
      </Mobile>
    </Row>
    <BackTop>
      <Icon className="icon-large" type="up-circle" theme="filled" />
    </BackTop>
  </Layout.Footer>
);

export default connect()(Footer);
