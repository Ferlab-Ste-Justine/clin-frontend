import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Dropdown, Button, Checkbox, Popover, Card, Spin, Input,
} from 'antd';
import { cloneDeep, isEqual } from 'lodash';

import IconKit from 'react-icons-kit';
import {
  ic_tune, ic_add, ic_swap_horiz, ic_view_column, ic_cloud_download, ic_search, ic_replay, ic_keyboard_arrow_right, ic_keyboard_arrow_down, ic_close, /* eslint-disable-line */
} from 'react-icons-kit/md';
import DataTablePagination from './Pagination';
import DataTable from './index';

import style from '../../containers/App/style.module.scss';
import './style.scss';

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

    this.toggleColumnReorderer = this.toggleColumnReorderer.bind(this);
    this.toggleColumnSelector = this.toggleColumnSelector.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
    this.handleColumnsSelected = this.handleColumnsSelected.bind(this);
    this.handleColumnResized = this.handleColumnResized.bind(this);
    this.handleResetColumnSelector = this.handleResetColumnSelector.bind(this);
    this.handleSearchColumnByQuery = this.handleSearchColumnByQuery.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.handleExport = this.handleExport.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isResizable = this.isResizable.bind(this);
    this.isReorderable = this.isReorderable.bind(this);
    this.isExportable = this.isExportable.bind(this);

    // @NOTE Initialize Component State
    this.state.orderedColumns = cloneDeep(props.schema);
  }

  componentDidMount() {
    this.handleResetColumnSelector();
  }

  isSelectable() {
    const { isSelectable } = this.props;

    return isSelectable;
  }

  isResizable() {
    const { isResizable } = this.props;

    return isResizable;
  }

  isReorderable() {
    const { isReorderable } = this.props;

    return isReorderable;
  }

  isExportable() {
    const { isExportable } = this.props;

    return isExportable;
  }

  toggleColumnReorderer() {
    if (this.isReorderable()) {
      const { columnReordererIsActive } = this.state;

      this.setState({
        columnReordererIsActive: !columnReordererIsActive,
      });
    }
  }

  handleResetColumnSelector() {
    if (this.isSelectable()) {
      const { defaultVisibleColumns } = this.props;
      const { orderedColumns } = this.state;
      const visibleColumns = defaultVisibleColumns.length > 0 ? defaultVisibleColumns : orderedColumns.map(column => column.key);

      this.setState({
        visibleColumns,
        matchingColumns: cloneDeep(visibleColumns),
      });
    }
  }

  handleSearchColumnByQuery(e) {
    if (this.isSelectable()) {
      const { orderedColumns } = this.state;
      const query = e.target.value.toLowerCase();
      const columnMatches = orderedColumns.filter(column => column.key.toLowerCase()
        .startsWith(query));

      this.setState({
        matchingColumns: columnMatches.map(match => match.key),
      });
    }
  }

  handleColumnsReordered(reorderedColumns) {
    if (this.isReorderable()) {
      this.setState({
        orderedColumns: reorderedColumns,
      });
    }
  }

  toggleColumnSelector() {
    if (this.isSelectable()) {
      const { columnSelectorIsActive } = this.state;

      this.setState({
        columnSelectorIsActive: !columnSelectorIsActive,
      });
    }
  }

  handleColumnsSelected(selection) {
    if (this.isSelectable()) {
      this.setState({
        visibleColumns: selection || [],
      });
    }
  }

  handlePageChange(next) {
    const { pageChangeCallback } = this.props;
    pageChangeCallback(next);
  }

  handlePageSizeChange(current, next) {
    const { pageSizeChangeCallback } = this.props;
    pageSizeChangeCallback(next);
  }

  handleColumnResized() {
    if (this.isResizable()) {
      const { resizeColumnCallback, isReorderable } = this.props;
      if (isReorderable) {
        resizeColumnCallback();
      }
    }
  }

  handleExport(columns) {
    if (this.isExportable()) {
      const { exportCallback } = this.props;

      exportCallback(columns);
    }
  }

  render() {
    const { intl } = this.props;
    const {
      size, page, total, orderedColumns, visibleColumns, matchingColumns, isLoading, columnReordererIsActive, columnSelectorIsActive,
    } = this.state;

    const isResizable = this.isResizable();
    const isReorderable = this.isReorderable();
    const isSelectable = this.isSelectable();
    const isExportable = this.isExportable();

    return (
      <Spin spinning={isLoading}>
        { (isReorderable || isSelectable || isExportable) && (
          <>
            <Row type="flex" justify="end">
              { isReorderable && (
                <Col>
                  <Button onClick={this.toggleColumnReorderer}>
                  <IconKit size={16} icon={ic_swap_horiz} /> { /* eslint-disable-line */ }
                    {intl.formatMessage({ id: 'components.table.action.organize' })}
                  </Button>
                </Col>
              ) }
              { isSelectable && (
                <Col>
                  <Dropdown
                    overlay={(
                      <Popover visible>
                        <Card
                          title={(
                            <Input
                              placeholder={intl.formatMessage({ id: 'components.table.action.search' })} suffix={<IconKit size={16} icon={ic_search} />} /* eslint-disable-line */
                              onChange={this.handleSearchColumnByQuery}
                            />
                          )}
                          bordered={false}
                        >
                          { !isEqual(orderedColumns.map(column => column.key), visibleColumns) && (
                          <Row>
                            <a onClick={this.handleResetColumnSelector}> { /* eslint-disable-line */ }
                              placeholder={intl.formatMessage({ id: 'components.table.action.reset' })} <IconKit size={16} icon={ic_replay} /> { /* eslint-disable-line */ }
                            </a>
                          </Row>
                          ) }
                          <Row>
                            <Checkbox.Group onChange={this.handleColumnsSelected} option={orderedColumns.map(column => column.key)} value={visibleColumns}>
                              { matchingColumns.map(key => (
                                <Row>
                                  <Col>
                                    <Checkbox value={key}>{key}</Checkbox>
                                  </Col>
                                </Row>
                              )) }
                            </Checkbox.Group>
                          </Row>
                        </Card>
                      </Popover>
                    )}
                    visible={columnSelectorIsActive}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button onClick={this.toggleColumnSelector}>
                  <IconKit size={16} icon={ic_view_column} /> { /* eslint-disable-line */ }
                      {intl.formatMessage({ id: 'components.table.action.display' })}
                    </Button>
                  </Dropdown>
                </Col>
              ) }
              { isExportable && (
                <Col>
                  <Button onClick={this.handleExport} className={`${style.btn} ${style.btnSec}`}>
                    <IconKit size={16} icon={ic_cloud_download} /> {intl.formatMessage({ id: 'components.table.action.export' })} { /* eslint-disable-line */ }
                  </Button>
                </Col>
              ) }
            </Row>
            <br />
          </>
        ) }
        <Row>
          <Col>
            <DataTable
              size={size}
              total={total}
              enableResizing={isResizable}
              enableReordering={(isReorderable && columnReordererIsActive)}
              reorderColumnsCallback={this.handleColumnsReordered}
              resizeColumnsCallback={this.handleColumnResized}
              columns={orderedColumns.filter(column => visibleColumns.indexOf(column) !== -1)}
              visibleColumns={visibleColumns}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col align="end">
            <DataTablePagination
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
  schema: PropTypes.shape({}).isRequired,
  defaultVisibleColumns: PropTypes.shape([]),
  isReorderable: PropTypes.bool,
  isResizable: PropTypes.bool,
  isSelectable: PropTypes.bool,
  isExportable: PropTypes.bool,
  exportCallback: PropTypes.func,
  resizeColumnCallback: PropTypes.func,
  pageChangeCallback: PropTypes.func,
  pageSizeChangeCallback: PropTypes.func,
};

InteractiveTable.defaultProps = {
  defaultVisibleColumns: [],
  isReorderable: true,
  isResizable: true,
  isSelectable: true,
  isExportable: true,
  exportCallback: () => {},
  resizeColumnCallback: () => {},
  pageChangeCallback: () => {},
  pageSizeChangeCallback: () => {},
};

export default InteractiveTable;
