import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Card, Empty } from 'antd';

import Content from '../../Content';

import './style.scss';

const NoMatchScreen = ({ intl }) => (
  <>
    <Content>
      <Card className="animated rotateIn">
        <Empty
          description={intl.formatMessage({ id: 'screen.nomatch.404' })}
        />
      </Card>
    </Content>
  </>
);

NoMatchScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(NoMatchScreen);
