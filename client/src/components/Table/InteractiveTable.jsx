/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Pagination, Row, Col, Dropdown, Button, Icon, Checkbox, Popover, Card,
} from 'antd';

import TableResults, { createCellRenderer } from 'index';
import TablePagination from 'Pagination'

import { cloneDeep } from 'lodash';
import { tokenizeObjectByKeys } from '../../helpers/autocompleter';
import Autocompleter from '../../helpers/autocompleter';
import Content from '../screens/PatientVariant';


class InteractiveTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      size: 10,
      page: 1,
      isLoading: false,
      columnReordererIsActive: false,
      columnSelectorIsActive: false,
      orderedColumns: [],
      visibleColumns: [],
    };

    props.schema = [
      { key: 'patientId', label: 'Patient Id', renderer: createCellRenderer('text', this.getData, { key: 'id' }) },
    ]


    this.getData = this.getData.bind(this);
    this.toggleColumnReorderer = this.toggleColumnReorderer.bind(this);
    this.toggleColumnSelector = this.toggleColumnSelector.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
    this.handleColumnsSelected = this.handleColumnsSelected.bind(this);

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);

    // @NOTE Initialize Component State
    this.columnPreset = props.schema;
    this.state.orderedColumns = cloneDeep(this.columnPreset)
    this.state.visibleColumns = this.columnPreset.map(column => column.key)
  }

  getData() {
    const { data } = this.props;

    return data;
  }

  toggleColumnReorderer() {
    const { columnReordererIsActive } = this.state;

    this.setState({
      columnReordererIsActive: !columnReordererIsActive
    })
  }

  handleColumnsReordered(reorderedColumns) {
    this.setState({
      orderedColumns: reorderedColumns,
    })
  }

  toggleColumnSelector() {
    const { columnSelectorIsActive } = this.state;

    this.setState({
      columnSelectorIsActive: !columnSelectorIsActive
    })
  }

  handleColumnsSelected(selection) {
    this.setState({
      visibleColumns: selection,
    });
  }

  handlePageChange(next) {
    const { pageChangeCallback } = this.props;

    this.setState({
      page: next,
    }, () => {
      pageChangeCallback(next)
    })
  }

  handlePageSizeChange(current, next) {
    const { pageSizeChangeCallback } = this.props;

    if (current !== next) {
      this.setState({
        size: next,
      }, () => {
        pageSizeChangeCallback(next)
      })
    }
  }


  render() {
    const {
      size, page, total, orderedColumns, visibleColumns, isLoading,
    } = this.state;

    return (
      <Spin spinning={isLoading}>
        <Row>
          <Col align="end">
            <Dropdown key="columns-selector" overlay={(
              <Popover>
                <Card>
                  <Row>
                    <Checkbox.Group className="checkbox" style={{ width: '100%' }} defaultValue={visibleColumns} onChange={this.handleColumnsSelected}>
                      {orderedColumns.map(column => {
                        return (
                          <Row key={column.key}>
                            <Col>
                              <Checkbox value={column.key}>{column.label}</Checkbox>
                            </Col>
                          </Row>
                        )
                      })}
                    </Checkbox.Group>
                  </Row>
                </Card>
              </Popover>
            )} trigger={['hover']}>
              <Button type="primary">
                Columns
                <Icon type="caret-down" />
              </Button>
            </Dropdown>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <TableResults
              key="interactive-table"
              size={size}
              total={total}
              columns={orderedColumns.filter(column => visibleColumns.indexOf(column.key) !== -1 )}
              reorderColumnsCallback={this.handleColumnsReordered}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col align="end">
            <TablePagination
              key="interactive-pagination"
              size={size}
              total={total}
              page={page}
              pageChangeCallback={this.handlePageChange}
              sizeChangeCallback={this.handlePageSizeChange}
            />
          </Col>
        </Row>
      </Spin>
    );
  }







}


InteractiveTable.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.array,
};

InteractiveTable.defaultProps = {
  data: [],
};

export default InteractiveTable;
