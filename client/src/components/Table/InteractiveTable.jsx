import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import {
  Row, Col, Button, Checkbox, Popover, Card, Spin, Input,
} from 'antd';
import {
  cloneDeep, isEqual, filter, pullAll, findIndex, find,
} from 'lodash';

import IconKit from 'react-icons-kit';
import {
  ic_tune, ic_add, ic_swap_horiz, ic_view_column, ic_cloud_download, ic_search, ic_replay, ic_keyboard_arrow_right, ic_keyboard_arrow_down, ic_close, /* eslint-disable-line */
} from 'react-icons-kit/md';
import DataTablePagination from './Pagination';
import DataTable from './index';

import style from '../../containers/App/style.module.scss';
import styleTable from './style.module.scss';


class InteractiveTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderedColumns: [],
      visibleColumns: [],
      matchingColumns: [],
      columnReordererIsActive: false,
      columnSelectorIsActive: false,
      searchValue: '',
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
    this.handleColumnsVisible = this.handleColumnsVisible.bind(this);

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

  handleColumnsVisible() {
    const { columnSelectorIsActive } = this.state;
    this.setState({
      columnSelectorIsActive: !columnSelectorIsActive,
    });
  }

  handleResetColumnSelector() {
    if (this.isSelectable()) {
      const { defaultVisibleColumns } = this.props;
      const { orderedColumns } = this.state;
      const visibleColumns = defaultVisibleColumns.length > 0 ? defaultVisibleColumns : orderedColumns.map(column => column.label);

      this.setState({
        visibleColumns,
        matchingColumns: cloneDeep(visibleColumns),
        searchValue: '',
      });
    }
  }

  handleSearchColumnByQuery(e) {
    if (this.isSelectable()) {
      const { orderedColumns } = this.state;
      const query = e.target.value.toLowerCase();
      const columnMatches = orderedColumns.filter(column => intl.get(column.label).toLowerCase()
        .startsWith(query));

      this.setState({
        matchingColumns: columnMatches.map(match => match.label),
        searchValue: e.target.value,
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
      const { visibleColumns, matchingColumns, orderedColumns } = this.state;
      const uncheckedColumns = matchingColumns.filter(name => !selection.includes(name));
      const toRemove = filter(visibleColumns, column => uncheckedColumns.includes(column));
      pullAll(visibleColumns, toRemove);

      const toAdd = selection.filter(name => !visibleColumns.includes(name));
      const addColumn = find(orderedColumns, column => toAdd.includes(column.label));
      const index = findIndex(orderedColumns, addColumn);
      addColumn ? visibleColumns.splice(index, 0, toAdd[0]) : null; /* eslint-disable-line */
      this.setState({
        visibleColumns,
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

  renderColumnWidth() {
    const {
      orderedColumns, visibleColumns,
    } = this.state;
    const filteredColumns = orderedColumns.filter(column => visibleColumns.indexOf(column.label) !== -1);
    const columnWidth = Array(filteredColumns.length).fill(150);
    // eslint-disable-next-line array-callback-return
    filteredColumns.map((column, index) => {
      switch (column.key) {
        case 'mutationId':
          columnWidth[index] = 200;
          break;
        case 'consequences':
          columnWidth[index] = 250;
          break;
        case 'exomiser':
          columnWidth[index] = 100;
          break;
        case 'type':
          columnWidth[index] = 100;
          break;
        case 'clinvar':
          columnWidth[index] = 160;
          break;
        case 'zygosity':
          columnWidth[index] = 90;
          break;
        case 'seq':
          columnWidth[index] = 80;
          break;
        default:
          columnWidth[index] = 150;
          break;
      }
    });
    return columnWidth;
  }

  render() {
    const {
      size, page, total, isLoading, numFrozenColumns, copyCallback, rowHeight,
    } = this.props;
    const {
      orderedColumns, visibleColumns, matchingColumns, columnReordererIsActive, columnSelectorIsActive, searchValue,
    } = this.state;
    const isResizable = this.isResizable();
    const isReorderable = this.isReorderable();
    const isSelectable = this.isSelectable();
    const isExportable = this.isExportable();
    const filteredColumns = orderedColumns.filter(column => visibleColumns.indexOf(column.label) !== -1);
    const columnWidth = this.renderColumnWidth(filteredColumns);
    this.renderColumnWidth(filteredColumns);
    const content = (
      <Card
        className={`${styleTable.columnFilter}`}
        title={(
          <Input
            className="SearchInput"
            placeholder={intl.get('components.table.action.search')} suffix={<IconKit size={16} icon={ic_search} />} /* eslint-disable-line */
            onChange={this.handleSearchColumnByQuery}
            value={searchValue}
          />
          )}
        bordered={false}
      >
        { !isEqual(orderedColumns.map(column => column.label), visibleColumns) && (
          <Row>
            <a onClick={this.handleResetColumnSelector}> { /* eslint-disable-line */ }
              {intl.get('components.table.action.reset')} <IconKit size={16} icon={ic_replay} /> { /* eslint-disable-line */ }
            </a>
          </Row>
        ) }
        <Row>

          <Checkbox.Group onChange={this.handleColumnsSelected} option={orderedColumns.map(column => column.key)} className={`${style.checkbox} `} value={cloneDeep(visibleColumns)}>
            { matchingColumns.map(key => (
              <Row>
                <Col>
                  <Checkbox className={visibleColumns.includes(key) ? `${style.check}` : null} value={key}>{ intl.get(key) }</Checkbox>
                </Col>
              </Row>
            )) }
          </Checkbox.Group>
        </Row>
      </Card>
    );
    return (
      <Spin spinning={isLoading}>
        { (isReorderable || isSelectable || isExportable) && (
          <>
            <Row type="flex" justify="end">
              { isReorderable && (
                <Col>
                  <Button onClick={this.toggleColumnReorderer} className={columnReordererIsActive ? `${styleTable.activeButton} ${style.btnSec} ${style.btn}` : `${style.btnSec}  ${style.btn}`}>
                  <IconKit size={16} icon={ic_swap_horiz} /> { /* eslint-disable-line */ }
                    {intl.get('components.table.action.organize')}
                  </Button>
                </Col>
              ) }
              { isSelectable && (
                <Col>
                  <Popover
                    trigger="click"
                    content={content}
                    placement="bottom"
                    onVisibleChange={this.handleColumnsVisible}
                  >
                    <Button onClick={this.toggleColumnSelector} className={columnSelectorIsActive ? `${styleTable.activeButton}  ${style.btnSec} ${style.btn}` : `${style.btnSec}  ${style.btn}`}>
                          <IconKit size={16} icon={ic_view_column} /> { /* eslint-disable-line */ }
                      {intl.get('components.table.action.display')}
                    </Button>
                  </Popover>
                </Col>
              ) }
              { isExportable && (
                <Col>
                  <Button onClick={this.handleExport} className={`${style.btn} ${style.btnSec}`}>
                    <IconKit size={16} icon={ic_cloud_download} /> {intl.get('components.table.action.export')} { /* eslint-disable-line */ }
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
              numFrozenColumns={numFrozenColumns}
              columns={filteredColumns}
              columnWidth={columnWidth}
              copyCallback={copyCallback}
              enableGhostCells
              rowHeight={rowHeight}
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
              pageSizeChangeCallback={this.handlePageSizeChange}
            />
          </Col>
        </Row>
      </Spin>
    );
  }
}

InteractiveTable.propTypes = {
  schema: PropTypes.shape({}).isRequired,
  size: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  defaultVisibleColumns: PropTypes.shape([]),
  numFrozenColumns: PropTypes.bool,
  isLoading: PropTypes.bool,
  isReorderable: PropTypes.bool,
  isResizable: PropTypes.bool,
  isSelectable: PropTypes.bool,
  isExportable: PropTypes.bool,
  exportCallback: PropTypes.func,
  resizeColumnCallback: PropTypes.func,
  pageChangeCallback: PropTypes.func,
  pageSizeChangeCallback: PropTypes.func,
  copyCallback: PropTypes.func,
  rowHeight: PropTypes.number,
};

InteractiveTable.defaultProps = {
  defaultVisibleColumns: [],
  isLoading: false,
  isReorderable: true,
  isResizable: true,
  isSelectable: true,
  isExportable: true,
  numFrozenColumns: 0,
  exportCallback: () => {},
  resizeColumnCallback: () => {},
  pageChangeCallback: () => {},
  pageSizeChangeCallback: () => {},
  copyCallback: () => {},
  rowHeight: null,
};

export default InteractiveTable;
