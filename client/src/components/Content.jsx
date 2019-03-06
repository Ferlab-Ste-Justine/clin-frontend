import React from 'react';
import { Layout } from 'antd';

const Content = (props) => {
  const { children } = props; // eslint-disable-line react/prop-types
  return (
    <Layout.Content id="content">
      {children}
    </Layout.Content>
  );
};

export default Content;
