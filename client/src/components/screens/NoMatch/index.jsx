import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Card, Empty } from 'antd';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';


const NoMatchScreen = ({ intl }) => (
  <Content type="centered">
    <Header />
    <Card className="animated rotateIn">
      <Empty
        description={intl.formatMessage({ id: 'screen.nomatch.404' })}
      />
    </Card>
    <Footer />
  </Content>
);

NoMatchScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(NoMatchScreen);
