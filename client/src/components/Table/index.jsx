import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, Cell, RenderMode, Column, Utils,
} from '@blueprintjs/table';
import {
  Badge, Button, Typography,
} from 'antd';
import { cloneDeep } from 'lodash';

import style from '../../containers/App/style.module.scss';
// import customStyle from './style.module.scss';

const TableHeader = () => null;

const TableFooter = () => null;


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
          <Cell>{valueRenderer(value)}</Cell>
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
    columns, size, total, enableReordering, enableResizing, renderContextMenuCallback, reorderColumnsCallback, resizeColumnsCallback,
    numFrozenColumns, enableGhostCells,
  } = props;
  const rowsCount = size <= total ? size : total;

  const handleColumnsReordered = (oldIndex, newIndex, length) => {
    if (oldIndex === newIndex) {
      return;
    }

    reorderColumnsCallback(Utils.reorderArray(columns, oldIndex, newIndex, length));
  };

  return (
    <>
      <TableHeader className={style.tableHeader} />
      <Table
        className={style.tableBody}
        numRows={rowsCount}
        numFrozenColumns={numFrozenColumns}
        enableGhostCells={enableGhostCells}
        renderMode={RenderMode.BATCH_ON_UPDATE}
        enableColumnReordering={enableReordering}
        enableColumnResizing={enableResizing}
        bodyContextMenuRenderer={renderContextMenuCallback}
        onColumnsReordered={handleColumnsReordered}
        onColumnWidthChanged={resizeColumnsCallback}
      >
        { columns.map(column => (
          <Column
            className={style.tableColumn}
            key={column.key}
            name={column.label}
            cellRenderer={column.renderer}
          />
        )) }
      </Table>
      <TableFooter className={style.tableFooter} />
    </>
  );
};

TableBody.propTypes = {
  size: PropTypes.number,
  total: PropTypes.number,
  columns: PropTypes.shape([]),
  numFrozenColumns: PropTypes.number,
  enableReordering: PropTypes.bool,
  enableResizing: PropTypes.bool,
  enableGhostCells: PropTypes.bool,
  renderContextMenuCallback: PropTypes.func,
  reorderColumnsCallback: PropTypes.func,
  resizeColumnsCallback: PropTypes.func,
};

TableBody.defaultProps = {
  size: 0,
  total: 0,
  columns: [],
  numFrozenColumns: 0,
  enableReordering: false,
  enableResizing: false,
  enableGhostCells: false,
  renderContextMenuCallback: () => {},
  reorderColumnsCallback: () => {},
  resizeColumnsCallback: () => {},
};

export default TableBody;
