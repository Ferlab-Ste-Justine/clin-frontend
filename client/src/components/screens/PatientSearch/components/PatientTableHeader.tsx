import { Col, Row } from 'antd';
import React from 'react';
import { TableItemsCount } from './TableItemsCount';

type Props = {
  page: number;
  size: number;
  total: number;
}

export const PatientsTableHeader: React.FC<Props> = ({
  page,
  size,
  total,
}) => (
  <Row align="middle" gutter={32}>
    <Col>
      <TableItemsCount page={page} size={size} total={total} />
    </Col>
  </Row>
);
