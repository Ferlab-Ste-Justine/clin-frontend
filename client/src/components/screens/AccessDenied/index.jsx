import React from 'react';
import { Card, Row, Typography } from 'antd';
import intl from 'react-intl-universal';
import IconKit from 'react-icons-kit';
import {
  ic_lock,
} from 'react-icons-kit/md';
import './style.scss';
import Layout from '../../Layout';

const goBack = () => {
  // @NOTE Path is: denied resource -> access-denied; we must go back before the denied resource location
  window.history.go(-3);
};

const AccessDeniedScreen = () => (
  <Layout>
    <Card className="accessDeniedBackground">
      <Card bordered={false} className="accessDeniedContent">
        <Row>
          <IconKit className="iconLock" size={72} icon={ic_lock} />
        </Row>
        <Row>
          <Typography.Title className="title" level={4}> {intl.get('screen.accessdenied.title')}</Typography.Title>
        </Row>
        <Row>
          <Typography.Text className="text">{intl.get('screen.accessdenied.description')}</Typography.Text>
        </Row>
        <Row>
          {window.history.length > 2 ? <button type="button" className="buttonBack" onClick={goBack}>{intl.get('screen.accessdenied.button')}</button> : null}
        </Row>
      </Card>
    </Card>
  </Layout>
);

export default AccessDeniedScreen;
