import React from 'react';
import { Col, Row } from 'antd';

const Content = (props) => {
  const { children, type } = props; // eslint-disable-line react/prop-types
  return (
    <Row id="container" type="flex">
      <Col id={`${type || 'stretched'}-screen`} span={24}>
        {children}
      </Col>
    </Row>
  );
};

export default Content;
