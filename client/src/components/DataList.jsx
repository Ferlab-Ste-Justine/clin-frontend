import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, List, Row, Col, Typography, Empty,
} from 'antd';
import intl from 'react-intl-universal';

function DataList(props) {
  const {
    title, dataSource, style, extraInfo,
  } = props;
  return (
    <Card className="staticCard" title={title} extra={extraInfo} hoverable style={style} bordered={false}>
      <List
        dataSource={dataSource}
        locale={{
          emptyText: (<Empty image={false} description={intl.get('components.dataList.emptyRow')} />),
        }}
        renderItem={(item) => (
          <List.Item className="listRow">
            <Row type="flex" justify="space-between" align="middle" style={{ width: '100%' }}>
              <Col className="rowTitle">
                <Typography.Text>{ item.label }</Typography.Text>
              </Col>
              <Col className="rowValue">
                <Typography.Text>{ item.value }</Typography.Text>
              </Col>
            </Row>
          </List.Item>
        )}
      />
    </Card>
  );
}

DataList.propTypes = {
  title: PropTypes.string.isRequired,
  dataSource: PropTypes.array,
  style: PropTypes.shape({}),
  extraInfo: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
};

DataList.defaultProps = {
  style: {},
  dataSource: [],
  extraInfo: '',
};

export default DataList;
