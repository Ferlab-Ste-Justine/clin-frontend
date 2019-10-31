/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import {
  Layout, Row, Col, Typography,
} from 'antd';
import IconKit from 'react-icons-kit';
/* eslint-disable-next-line */
import { ic_phone, ic_launch, ic_email, ic_location_on } from 'react-icons-kit/md';

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
                  123 Rue Metcalf, Montreal QC, A1A 1A1
                </li>
              </ul>
            </nav>
          </Col>
          <Col>
            <img className="logo" alt="Saint-Justine" src="/images/logo_CHUSJ.png" />
          </Col>
      </div>
    </Row>
    <Row className="footerSecondary" type="flex" align="middle">
        <div className="footerLogo">
            <nav>
              <ul>
                <li><a href="#">Accessibilité</a></li>
                <li><a href="#">Accès à l'information</a></li>
                <li><a href="#">Politique de confidentialité</a></li>
                <li><a href="#">À propos</a></li>
              </ul>
            </nav>
            <img className="logo" alt="Saint-Justine" src="/images/msss.png" />
        </div>
    </Row>
  </Layout.Footer>
);

export default connect()(Footer);
