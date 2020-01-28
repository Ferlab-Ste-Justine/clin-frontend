import React from 'react';
import intl from 'react-intl-universal';
import { Card, Empty } from 'antd';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';


const NoMatchScreen = () => (
  <Content type="stretched-centered">
    <Header />
    <Navigation />
    <Card className="animated rotateIn">
      <Empty
        description={intl.get('screen.nomatch.404')}
      />
    </Card>
    <Footer />
  </Content>
);

export default NoMatchScreen;
