import React from 'react';
import { Card, Row, Col } from 'antd';
import intl from 'react-intl-universal';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';

const goBack = () => {
  // @NOTE Path is: denied resource -> access-denied; we must go back before the denied resource location
  window.history.go(-3);
};

const AccessDeniedScreen = () => (
  <Content type="auto">
    <Header />
    <Card className="entity">
      <Row type="flex" gutter={32}>
        <Col span={12} className="gutter-row">
          {intl.get('screen.accessdenied.title')}
          {intl.get('screen.accessdenied.description')}
          {window.history.length > 2 ? <button type="button" onClick={goBack}>{intl.get('screen.accessdenied.button')}</button> : null }
        </Col>
      </Row>
    </Card>
    <Footer />
  </Content>
);

export default AccessDeniedScreen;
