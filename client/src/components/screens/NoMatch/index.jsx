import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';

const NoMatch = () => (
  <>
    <Header />
    <Content>
      <FormattedMessage id="screen.nomatch.404" defaultMessage=" " />
    </Content>
    <Footer />
  </>
);

export default connect()(NoMatch);
