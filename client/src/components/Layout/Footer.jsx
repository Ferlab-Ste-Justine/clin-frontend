import React from 'react';
import get from 'lodash/get'
import IconKit from 'react-icons-kit';
import {
  ic_email, ic_launch, ic_location_on,
  ic_phone,
} from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { Col, Layout, Row, Typography } from 'antd';

const { Text } = Typography;
const ZEPLIN_URL = get(window, 'CLIN.zeplinUrl', process.env.REACT_APP_ZEPLIN_URL)
const FHIR_CONSOLE_URL = get(window, 'CLIN.fhirConsoleUrl', process.env.REACT_APP_FHIR_CONSOLE_URL)

const Footer = () => (
  <Layout.Footer id="footer">
    <Row align="middle" className="flex-row footerPrimary">
      <div className="footerNav">
        <Col>
          <Text className="navTitle" type="primary">{ intl.get('footer.navigation.primary.information') }</Text>
          <nav>
            <ul>
              <li>
                <a href="#">{ intl.get('footer.navigation.primary.documentation') }</a>
              </li>
              <li><a href="#">{ intl.get('footer.navigation.primary.faq') }</a></li>
              <li>
                <a href="#">
                  { intl.get('footer.navigation.primary.link') }
                  <IconKit icon={ic_launch} size={16} />
                </a>
              </li>
            </ul>
          </nav>
        </Col>
        <Col>
          <Text className="navTitle" type="primary">{ intl.get('footer.navigation.primary.contact') }</Text>
          <nav>
            <ul>
              <li>
                <IconKit icon={ic_phone} size={16} />
                { intl.get('footer.navigation.primary.phone') }
              </li>
              <li>
                <IconKit icon={ic_email} size={16} />
                { intl.get('footer.navigation.primary.email') }
              </li>
              <li>
                <IconKit icon={ic_location_on} size={16} />
                { intl.get('footer.navigation.primary.address') }
              </li>
            </ul>
          </nav>
        </Col>
        <Col>
          <img alt="Saint-Justine" className="logo" src="/assets/logos/chujs-white.svg" />
        </Col>
      </div>
    </Row>
    <Row align="middle" className="flex-row footerSecondary">
      <div className="footerLogo">
        <nav>
          <ul>
            <li><a href="#">{ intl.get('footer.navigation.secondary.accessibility') }</a></li>
            <li><a href="#">{ intl.get('footer.navigation.secondary.access') }</a></li>
            <li><a href="#">{ intl.get('footer.navigation.secondary.confidentiality') }</a></li>
            <li><a href="#">{ intl.get('footer.navigation.secondary.about') }</a></li>
            <li><a href={ZEPLIN_URL}> Zeppelin </a></li>
            <li><a href={FHIR_CONSOLE_URL}> Fhir </a></li>
          </ul>
        </nav>
        <img alt="Saint-Justine" className="logo" src="/assets/logos/msssq.svg" />
      </div>
    </Row>
  </Layout.Footer>
);

export default connect()(Footer);
