import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, List, Row, Col, Typography, Empty,
} from 'antd';


const DataList = (props) => {
  const {
    title, dataSource, style, extraInfo,
  } = props;
  const header = (<Typography.Title level={4} className="datalisteHeader" style={{ marginBottom: 0 }}>{title}</Typography.Title>);
  return (
    <Card className="datalist" title={header} type="inner" size="small" extra={extraInfo} hoverable style={style}>
      <List
        size="small"
        dataSource={dataSource}
        locale={{
          emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
        }}
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
  extraInfo: PropTypes.string,
};

DataList.defaultProps = {
  style: {},
  dataSource: [],
  extraInfo: '',
};

export default DataList;
