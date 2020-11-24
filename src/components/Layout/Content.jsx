import React from 'react';
import { Col, Row } from 'antd';

const Content = (props) => {
  const { children } = props; // eslint-disable-line react/prop-types
  return (
    <Row id="content">
      <Col span={24}>
        { children }
      </Col>
    </Row>
  );
};

export default Content;
