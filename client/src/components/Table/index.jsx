/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, Cell, RenderMode, Column, Utils,
} from '@blueprintjs/table';
import {
  Badge, Button, Typography,
} from 'antd';
import { isFunction, cloneDeep } from 'lodash';

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
  switch (type) {
    default:
    case 'text':
      valueRenderer = value => (<Typography.Text {...options.style} type={options.type} ellipsis>{value}</Typography.Text>);
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
          data-key={key}
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
      valueRenderer = options.renderer
      break;
  }

  return (row) => {
    try {
      const dataSet = getData();
      const value = dataSet[row] ? dataSet[row][options.key] ? dataSet[row][options.key] : cloneDeep(dataSet[row]) : '';

      return (
        <Cell>{valueRenderer(value)}</Cell>
      );
    } catch (e) {
      return <Cell/>
    }
  };
};

const TableBody = (props) => {
  const {
    columns, size, total, renderMode, enableGhostCells, enableReordering, enableResizing, renderContextMenu, reorderColumnsCallback,
  } = props;

  const handleColumnsReordered = (oldIndex, newIndex, length) => {
    if (oldIndex === newIndex) {
      return;
    }

    reorderColumnsCallback( Utils.reorderArray(columns, oldIndex, newIndex, length) )
  };

  return (
    <>
      <TableHeader />
      <Table
        numRows={(size <= total ? size : total)}
        renderMode={renderMode}
        enableColumnReordering={enableReordering}
        enableColumnResizing={enableResizing}
        enableGhostCells={enableGhostCells}
        bodyContextMenuRenderer={renderContextMenu}
        onColumnsReordered={handleColumnsReordered}
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
    </>
  );
};

TableBody.propTypes = {
  size: PropTypes.number,
  total: PropTypes.number,
  columns: PropTypes.shape([]),
  renderMode: PropTypes.string,
  enableGhostCells: PropTypes.bool,
  enableReordering: PropTypes.bool,
  enableResizing: PropTypes.bool,
  renderContextMenu: PropTypes.func,
  reorderColumnsCallback: PropTypes.func,
};

TableBody.defaultProps = {
  size: 0,
  total: 0,
  columns: [],
  renderMode: RenderMode.NONE,
  enableGhostCells: true,
  enableReordering: true,
  enableResizing: true,
  renderContextMenu: () => {},
  reorderColumnsCallback: () => {},
};

export default TableBody;
