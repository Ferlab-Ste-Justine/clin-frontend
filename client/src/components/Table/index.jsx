import shortid from 'shortid';
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import {
  Table, Cell, RenderMode, Column, Utils,
} from '@blueprintjs/table';
import {
  Badge, Button, Typography, Checkbox,
} from 'antd';
import { cloneDeep } from 'lodash';
import './style.scss';

import styleTable from './style.module.scss';


export const createCellRenderer = (type, getData, options = {}) => {
  try {
    let valueRenderer = null;
    switch (type) {
      default:
      case 'text':
        valueRenderer = value => (
          <Typography.Text {...options.style} type={options.type} ellipsis>{value}</Typography.Text>);
        break;
      case 'paragraph':
        valueRenderer = value => (<Typography.Paragraph ellipsis>{value}</Typography.Paragraph>);
        break;
      case 'link':
        valueRenderer = value => (
          <a
            type="link"
            href={(options.renderer ? options.renderer(value) : '#')}
          >
            {value}
          </a>
        );
        break;
      case 'button':
        valueRenderer = value => (
          <Button
            type={options.type}
            size={options.size}
            shape={options.shape}
            icon={options.icon}
            onClick={options.handler}
            data-id={value}
          >
            {options.label || value}
          </Button>
        );
        break;
      case 'badge':
        valueRenderer = value => (<Badge count={value} />);
        break;
      case 'dot':
        valueRenderer = value => (<Badge status={options.renderer(value)} text={value} />);
        break;
      case 'custom':
        valueRenderer = options.renderer;
        break;
      case 'checkbox':
        valueRenderer = () => (<Checkbox />);
        break;
    }

    return (row) => {
      try {
        const dataSet = getData();
        const value = dataSet[row] ? dataSet[row][options.key] ? dataSet[row][options.key] : cloneDeep(dataSet[row]) : ''; // eslint-disable-line
        return (
          <Cell className={row % 2 !== 0 ? `${styleTable.cellValue} ${styleTable.evenRow}` : `${styleTable.cellValue}`}>
            {valueRenderer(value)}
          </Cell>
        );
      } catch (e) {
        return <Cell loading />;
      }
    };
  } catch (e) {
    return () => {};
  }
};

const DataTable = (props) => {
  const {
    columns, size, total, enableReordering, enableResizing, renderContextMenuCallback, reorderColumnsCallback, resizeColumnCallback,
    numFrozenColumns, enableGhostCells, copyCallback, columnWidth,
  } = props;
  const rowsCount = size <= total ? size : total;
  const handleColumnsReordered = (oldIndex, newIndex, length) => {
    if (oldIndex === newIndex) {
      return;
    }

    reorderColumnsCallback(Utils.reorderArray(columns, oldIndex, newIndex, length));
  };
  return (
    <Table
      key={shortid.generate()}
      numRows={rowsCount}
      numFrozenColumns={numFrozenColumns}
      enableGhostCells={enableGhostCells}
      renderMode={RenderMode.BATCH_ON_UPDATE}
      enableColumnReordering={enableReordering}
      enableColumnResizing={enableResizing}
      bodyContextMenuRenderer={renderContextMenuCallback}
      onColumnsReordered={handleColumnsReordered}
      onColumnWidthChanged={resizeColumnCallback}
      defaultRowHeight={36}
      getCellClipboardData={copyCallback}
      className={styleTable.table}
      columnWidths={columnWidth}
    >
      { columns.map(definition => (
        <Column
          id={definition.key}
          name={intl.get(definition.label)}
          cellRenderer={definition.renderer}
        />
      )) }
    </Table>
  );
};

DataTable.propTypes = {
  size: PropTypes.number,
  total: PropTypes.number,
  columns: PropTypes.shape([]),
  numFrozenColumns: PropTypes.number,
  enableReordering: PropTypes.bool,
  enableResizing: PropTypes.bool,
  enableGhostCells: PropTypes.bool,
  renderContextMenuCallback: PropTypes.func,
  reorderColumnsCallback: PropTypes.func,
  resizeColumnCallback: PropTypes.func,
  copyCallback: PropTypes.func,
  columnWidth: PropTypes.shape([]),
};

DataTable.defaultProps = {
  size: 0,
  total: 0,
  columns: [],
  numFrozenColumns: 0,
  enableReordering: false,
  enableResizing: false,
  enableGhostCells: false,
  renderContextMenuCallback: () => {},
  reorderColumnsCallback: () => {},
  resizeColumnCallback: () => {},
  copyCallback: null,
  columnWidth: [],
};

export default DataTable;
