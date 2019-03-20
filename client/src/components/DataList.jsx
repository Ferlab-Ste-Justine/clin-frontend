import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, List, Row, Col, Typography,
} from 'antd';

const DataList = (props) => {
  const { title, dataSource } = props;
  const header = (<Typography.Title level={4} style={{ marginBottom: 0 }}>{title}</Typography.Title>);
  return (
    <Card title={header} type="inner" size="small" hoverable>
      <List
        size="small"
        dataSource={dataSource}
        renderItem={item => (
          <List.Item style={{ padding: 5 }}>
            <Row type="flex" justify="space-between" style={{ width: '100%' }}>
              <Col span={12}>
                <Typography.Text strong>{item.label}</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text>{item.value}</Typography.Text>
              </Col>
            </Row>
          </List.Item>
        )}
      />
    </Card>
  );
};

DataList.propTypes = {
  title: PropTypes.string.isRequired,
  dataSource: PropTypes.shape([{ label: PropTypes.string.isRequired, value: PropTypes.any }]).isRequired,
};

export default DataList;
