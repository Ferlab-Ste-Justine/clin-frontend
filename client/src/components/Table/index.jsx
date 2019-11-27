/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, Cell, Column, Utils,
} from '@blueprintjs/table';
import {
  Badge, Button, Typography, Spin,
} from 'antd';
import { cloneDeep } from 'lodash';

import './style.scss';


const TableHeader = (props) => {
  const { label } = props;
  return (<div>{label}</div>);
};

TableHeader.propTypes = {
  label: PropTypes.string,
};

TableHeader.defaultProps = {
  label: '',
};

const TableFooter = (props) => {
  const { label } = props;
  return (<div>{label}</div>);
};

TableFooter.propTypes = {
  label: PropTypes.string,
};

TableFooter.defaultProps = {
  label: '',
};


export const createCellRenderer = (type, getData, options = {}) => {
  let valueRenderer = null;
  try {
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
          <Button
            type="link"
            size={options.size}
            shape={options.shape}
            icon={options.icon}
            href={(options.renderer ? options.renderer(value) : '#')}
          >
            {value}
          </Button>
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
          >
            {value}
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
    }

    return (row) => {
      try {
        const dataSet = getData();
        const value = dataSet[row] ? dataSet[row][options.key] ? dataSet[row][options.key] : cloneDeep(dataSet[row]) : ''; // eslint-disable-line

        return (
          <Cell className="CellValue">{valueRenderer(value)}</Cell>
        );
      } catch (e) {
        return <Cell />;
      }
    };
  } catch (e) {
    return () => {};
  }
};

const TableBody = (props) => {
  const {
    isLoading, columns, size, total, enableReordering, enableResizing, renderContextMenu, reorderColumnsCallback, resizeColumnsCallback,
    numFrozenColumns,
  } = props;

  const handleColumnsReordered = (oldIndex, newIndex, length) => {
    if (oldIndex === newIndex) {
      return;
    }

    reorderColumnsCallback(Utils.reorderArray(columns, oldIndex, newIndex, length));
  };
  return (
    <Spin spinning={isLoading}>
      <TableHeader />
      <Table
        numRows={(size <= total ? size : total)}
        numFrozenColumns={numFrozenColumns}
        enableColumnReordering={enableReordering}
        enableColumnResizing={enableResizing}
        bodyContextMenuRenderer={renderContextMenu}
        onColumnsReordered={handleColumnsReordered}
        onColumnWidthChanged={resizeColumnsCallback}
      >
        { columns.map(column => (
          <Column
            key={column.key}
            name={column.label}
            cellRenderer={column.renderer}
          />
        )) }
      </Table>
      <TableFooter />
    </Spin>
  );
};

TableBody.propTypes = {
  isLoading: PropTypes.bool,
  size: PropTypes.number,
  total: PropTypes.number,
  numFrozenColumns: PropTypes.number,
  columns: PropTypes.shape([]),
  enableReordering: PropTypes.bool,
  enableResizing: PropTypes.bool,
  renderContextMenu: PropTypes.func,
  reorderColumnsCallback: PropTypes.func,
  resizeColumnsCallback: PropTypes.func,
};

TableBody.defaultProps = {
  isLoading: false,
  size: 0,
  total: 0,
  numFrozenColumns: 0,
  columns: [],
  enableReordering: true,
  enableResizing: true,
  renderContextMenu: () => {},
  reorderColumnsCallback: () => {},
  resizeColumnsCallback: () => {},
};

export default TableBody;
