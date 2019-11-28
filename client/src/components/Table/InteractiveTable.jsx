/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Dropdown, Button, Icon, Checkbox, Popover, Card, Spin, Input,
} from 'antd';

import TableResults  from './index';
import TablePagination from './Pagination'

import { cloneDeep, isEqual, } from 'lodash';

import IconKit from '../screens/PatientSearch';
import {
  ic_tune, ic_add, ic_swap_horiz, ic_view_column, ic_cloud_download, ic_search, ic_replay, ic_keyboard_arrow_right, ic_keyboard_arrow_down, ic_close
} from 'react-icons-kit/md';

class InteractiveTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      orderedColumns: [],
      visibleColumns: [],
      matchingColumns: [],
      columnReordererIsActive: false,
      columnSelectorIsActive: false,
    };

    this.getData = this.getData.bind(this);
    this.toggleColumnReorderer = this.toggleColumnReorderer.bind(this);
    this.toggleColumnSelector = this.toggleColumnSelector.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
    this.handleColumnsSelected = this.handleColumnsSelected.bind(this);
    this.handleResetColumnOrder = this.handleResetColumnOrder.bind(this);
    this.handleSearchColumnByQuery = this.handleSearchColumnByQuery.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);

    // @NOTE Initialize Component State
    this.state.visibleColumns = props.defaultVisibleColumns || props.schema.map(column => column.key)
    this.handleResetColumnOrder();
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

  handleResetColumnOrder() {
    const { schema } = this.props;
    this.setState({
      columnSelectorIsActive: false,
      orderedColumns: cloneDeep(schema),
    })
  }

  handleSearchColumnByQuery(e) {
    let { orderedColumns } = this.state;
    const query = e.target.value.toLowerCase();
    const columnMatches = orderedColumns.filter(orderedName => orderedName.toLowerCase().startsWith(query));

    this.setState({
      matchingColumns: columnMatches,
    });
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
    pageChangeCallback(next);
  }

  handlePageSizeChange(current, next) {
    const { pageSizeChangeCallback } = this.props;
    pageSizeChangeCallback(next);
  }

  render() {
    const {
      size, page, total, orderedColumns, visibleColumns, matchingColumns, isLoading, columnReordererIsActive, columnSelectorIsActive,
    } = this.state;

    const columnSelector = (
      <Popover visible>
        <Card title={(
          <Input
            placeholder="Rechercher..."
            suffix={<IconKit size={16} icon={ic_search} />}
            onChange={this.handleSearchColumnByQuery}
          />
        )} className="columnFilter" bordered={false}>
          { !isEqual(orderedColumns.map(column => column.key), visibleColumns) && (
            <Row>
              <a className="reinitialiser" onClick={this.handleResetColumnOrder}>
                Réinitialiser
                <IconKit size={16} icon={ic_replay} />
              </a>
            </Row>
          ) }
          <Row>
            <Checkbox.Group className="checkbox" defaultValue={matchingColumns} onChange={this.handleColumnsSelected} option={matchingColumns} value={orderedColumns}>
              {matchingColumns.map((key, index) => (
                <Row key={index}>
                  <Col>
                    <Checkbox value={key}>{key}</Checkbox>
                  </Col>
                </Row>
              ))}
            </Checkbox.Group>
          </Row>
        </Card>
      </Popover>
    );

    return (
      <Spin spinning={isLoading}>
        <Row type="flex" justify="end" className="controls">
          <Col>
            <Button
              onClick={this.toggleColumnReorderer}
              className={columnReordererIsActive ? `reorder ${style.btnSec} ${style.btn}` : `${style.btnSec}  ${style.btn}`}
            >
              <IconKit size={16} icon={ic_swap_horiz} />
              Organiser
            </Button>
          </Col>
          <Col>
            <Dropdown overlay={columnSelector} trigger="click"  placement="bottomRight"  visible={columnSelectorIsActive}>
              <Button
                onClick={this.toggleColumnSelector}
                className={`${style.btn} ${style.btnSec}`}
              >
                <IconKit size={16} icon={ic_view_column} />
                Afficher
              </Button>
            </Dropdown>
          </Col>
          <Col>
            <Button
              onClick={this.exportToTsv}
              className={`${style.btn} ${style.btnSec}`}
            >
              <IconKit size={16} icon={ic_cloud_download} />
              Exporter
            </Button>
          </Col>
        </Row>
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
              size={size}
              total={total}
              columns={orderedColumns.filter(column => visibleColumns.indexOf(column.key) !== -1 )}
              reorderColumnsCallback={this.handleColumnsReordered}
              enableReordering={columnReordererIsActive}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col align="end">
            <TablePagination
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
  defaultVisibleColumns: PropTypes.array,


};

InteractiveTable.defaultProps = {
  data: [],
  defaultVisibleColumns: [],
};

export default InteractiveTable;
