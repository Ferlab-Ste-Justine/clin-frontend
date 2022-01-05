import React from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { Col, Layout, Row } from 'antd';
import get from 'lodash/get';

const ZEPLIN_URL = get(window, 'CLIN.zeplinUrl', process.env.REACT_APP_ZEPLIN_URL);
const FHIR_CONSOLE_URL = get(window, 'CLIN.fhirConsoleUrl', process.env.REACT_APP_FHIR_CONSOLE_URL);

const Footer = () => (
  <Layout.Footer id="footer">
    <Row align="middle" justify="space-between">
      <Col>
        <nav>
          <ul>
            <li>
              <a href={ZEPLIN_URL} rel="noreferrer" target="_blank"> {intl.get('footer.navigation.zepplin')} </a>
            </li>
            <li>
              <a href={FHIR_CONSOLE_URL} rel="noreferrer" target="_blank"> {intl.get('footer.navigation.fhir')} </a>
            </li>
          </ul>
        </nav>
      </Col>
      <Col>
        <img alt="Saint-Justine" className="logo" src="/assets/logos/chujs-color.svg" />
      </Col>
    </Row>
  </Layout.Footer>
);

export default connect()(Footer);
