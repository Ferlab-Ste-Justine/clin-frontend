import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  Button, Card, Table,
} from 'antd';
import { Link } from 'react-router-dom';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';


const data = [{
  key: '1',
  name: 'John Brown',
  age: 32,
  address: 'New York No. 1 Lake Park',
}, {
  key: '2',
  name: 'Jim Green',
  age: 42,
  address: 'London No. 1 Lake Park',
}, {
  key: '3',
  name: 'Joe Black',
  age: 32,
  address: 'Sidney No. 1 Lake Park',
}, {
  key: '4',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '5',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '6',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '7',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '8',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '9',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '10',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '11',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '12',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '13',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '14',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '15',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '16',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '17',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '18',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '19',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '20',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '21',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '22',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '23',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '24',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}, {
  key: '25',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}];

class ListScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.setAgeSort = this.setAgeSort.bind(this);
  }

  setAgeSort() {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'age',
      },
    });
  }

  clearAll() {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
    });
  }

  clearFilters() {
    this.setState({ filteredInfo: null });
  }

  handleChange(pagination, filters, sorter) {
    // console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }

  render() {
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filters: [
        { text: 'Joe', value: 'Joe' },
        { text: 'Jim', value: 'Jim' },
      ],
      render: text => (<Link to="/summary/123">{text}</Link>),
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    }, {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: (a, b) => a.age - b.age,
      sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order,
    }, {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      filters: [
        { text: 'London', value: 'London' },
        { text: 'New York', value: 'New York' },
      ],
      filteredValue: filteredInfo.address || null,
      onFilter: (value, record) => record.address.includes(value),
      sorter: (a, b) => a.address.length - b.address.length,
      sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
    }];

    return (
      <Content>
        <Header />
        <Card>
          <Button onClick={this.setAgeSort} htmlType="button">Sort age</Button>
          <Button onClick={this.clearFilters} htmlType="button">Clear filters</Button>
          <Button onClick={this.clearAll} htmlType="button">Clear filters and sorters</Button>
          <Table
            columns={columns}
            dataSource={data}
            size="middle"
            onChange={this.handleChange}
            pagination={{
              showTotal: (total, range) => (`${range[0]}-${range[1]} of ${total} items`),
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              defaultCurrent: 1,
              total: 25,
            }}

            /* onRow={(record, rowIndex) => {
              return {
                onClick: (event) => {},       // click row
                onDoubleClick: (event) => {}, // double click row
                onContextMenu: (event) => {}  // right button click row
                onMouseEnter: (event) => {}   // mouse enter row
                onMouseLeave: (event) => {}   // mouse leave row
              };
            }}
            onHeaderRow={(column) => {
              return {
                onClick: () => {},        // click header row
              };
            }} */
          />
        </Card>
        <Footer />
      </Content>
    );
  }
}

ListScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(ListScreen);
