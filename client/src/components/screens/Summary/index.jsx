import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Card } from 'antd';

import Content from '../../Content';

import './style.scss';

const SummaryScreen = ({ intl }) => ( // eslint-disable-line
  <>
    <Content>
      <Card>
          SummaryScreen
      </Card>
    </Content>
  </>
);

SummaryScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(SummaryScreen);
