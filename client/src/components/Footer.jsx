/* eslint-disable camelcase, jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import { connect } from 'react-redux';
import {
  Layout, Row, Col, Typography,
} from 'antd';
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
          <Text type="primary" className="navTitle">Information et services</Text>
          <nav>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">FAQ</a></li>
              <li>
                <a href="#">
                  Lien externe
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
                  (514)-123-4567
              </li>
              <li>
                <IconKit size={16} icon={ic_email} />
                  courriel@domain.com
              </li>
              <li>
                <IconKit size={16} icon={ic_location_on} />
                  3175 Chemin de la Côte-Sainte-Catherine, Montréal, QC H3T 1C5
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
            <li><a href="#">Accessibilité</a></li>
            <li><a href="#">{'Accès à l\'information'}</a></li>
            <li><a href="#">Politique de confidentialité</a></li>
            <li><a href="#">À propos</a></li>
          </ul>
        </nav>
        <img className="logo" alt="Saint-Justine" src="/assets/logos/msssq.svg" />
      </div>
    </Row>
  </Layout.Footer>
);

export default connect()(Footer);
