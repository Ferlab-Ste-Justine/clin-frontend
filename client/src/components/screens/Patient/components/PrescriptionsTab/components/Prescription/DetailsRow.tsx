import React, { ReactNode } from 'react';
import { Row, Col } from 'antd';

const DetailsRow: React.FC<{label: string | ReactNode}> = ({ label, children }) => (
  <Row className="flex-row prescriptions-tab__prescriptions-section__details__row">
    <Col className="prescriptions-tab__prescriptions-section__details__row__title">{ label }</Col>
    <Col className="prescriptions-tab__prescriptions-section__details__row__value">{ children }</Col>
  </Row>
);

export default DetailsRow;
