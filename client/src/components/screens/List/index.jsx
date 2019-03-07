import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Card } from 'antd';

import Content from '../../Content';

import './style.scss';

const ListScreen = ({ intl }) => ( // eslint-disable-line
  <>
    <Content>
      <Card>
          ListScreen
      </Card>
    </Content>
  </>
);

ListScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(ListScreen);
