import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, List, Row, Col, Typography,
} from 'antd';


const DataList = (props) => {
  const { title, dataSource, style } = props;
  const header = (<Typography.Title level={4} className="datalisteHeader" style={{ marginBottom: 0 }}>{title}</Typography.Title>);
  console.log('dataSource', dataSource);
  return (
    <Card className="datalist" title={header} type="inner" size="small" hoverable style={style}>
      <List
        size="small"
        dataSource={dataSource}
        renderItem={item => (
          <List.Item className="listRow">
            <Row type="flex" justify="space-between" style={{ width: '100%' }}>
              <Col className="rowTitle">
                <Typography.Text>{item.label}</Typography.Text>
              </Col>
              <Col className="rowValue">
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
  dataSource: PropTypes.shape([]),
  style: PropTypes.shape({}),
};

DataList.defaultProps = {
  style: {},
  dataSource: [],
};

export default DataList;
