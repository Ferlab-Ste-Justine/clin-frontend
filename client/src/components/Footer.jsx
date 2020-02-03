/* eslint-disable camelcase, jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import { connect } from 'react-redux';
import {
  Layout, Row, Col, Typography,
} from 'antd';
import intl from 'react-intl-universal';
import IconKit from 'react-icons-kit';
import {
  ic_phone, ic_launch, ic_email, ic_location_on,
} from 'react-icons-kit/md';


const { Text } = Typography;

const Footer = () => (
  <Layout.Footer id="footer">
    <Row className="footerPrimary" type="flex" align="middle">
      <div className="footerNav">
        <Col>
          <Text type="primary" className="navTitle">{ intl.get('footer.navigation.primary.information') }</Text>
          <nav>
            <ul>
              <li><a href="#">{ intl.get('footer.navigation.primary.documentation') }</a></li>
              <li><a href="#">{ intl.get('footer.navigation.primary.faq') }</a></li>
              <li>
                <a href="#">
                  { intl.get('footer.navigation.primary.link') }
                  <IconKit size={16} icon={ic_launch} />
                </a>
              </li>
            </ul>
          </nav>
        </Col>
        <Col>
          <Text type="primary" className="navTitle">Nous joindre</Text>
          <nav>
            <ul>
              <li>
                <IconKit size={16} icon={ic_phone} />
                { intl.get('footer.navigation.primary.phone') }
              </li>
              <li>
                <IconKit size={16} icon={ic_email} />
                { intl.get('footer.navigation.primary.email') }
              </li>
              <li>
                <IconKit size={16} icon={ic_location_on} />
                { intl.get('footer.navigation.primary.address') }
              </li>
            </ul>
          </nav>
        </Col>
        <Col>
          <img className="logo" alt="Saint-Justine" src="/assets/logos/chujs-white.svg" />
        </Col>
      </div>
    </Row>
    <Row className="footerSecondary" type="flex" align="middle">
      <div className="footerLogo">
        <nav>
          <ul>
            <li><a href="#">{ intl.get('footer.navigation.secondary.accessibility') }</a></li>
            <li><a href="#">{ intl.get('footer.navigation.secondary.access') }</a></li>
            <li><a href="#">{ intl.get('footer.navigation.secondary.confidentiality') }</a></li>
            <li><a href="#">{ intl.get('footer.navigation.secondary.about') }</a></li>
          </ul>
        </nav>
        <img className="logo" alt="Saint-Justine" src="/assets/logos/msssq.svg" />
      </div>
    </Row>
  </Layout.Footer>
);

export default connect()(Footer);
