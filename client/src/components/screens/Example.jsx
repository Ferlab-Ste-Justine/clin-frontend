import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';

import MyEnhancedForm from '../forms/Example';

const Example = () => (
  <div>
    <Button type="primary"><FormattedMessage id="home.greeting" defaultMessage=" " /></Button>
    <MyEnhancedForm />
  </div>
);

export default connect()(Example);
