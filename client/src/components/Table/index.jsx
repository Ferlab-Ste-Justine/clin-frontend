import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, Cell, RenderMode, Utils,
} from '@blueprintjs/table';
import {
  Badge, Button, Typography,
} from 'antd';

import './style.scss';


const TableHeader = (props) => {
  const { label } = props;
  return (<div>{label}</div>);
};

TableHeader.propTypes = {
  label: PropTypes.string,
};

TableHeader.defaultProps = {
  label: 'Untiled',
};

const TableFooter = (props) => {
  const { label } = props;
  return (<div>{label}</div>);
};

TableFooter.propTypes = {
  label: PropTypes.string,
};

TableFooter.defaultProps = {
  label: 'Untiled',
};

export const createCellRenderer = (key, type, dataSet, options = {}) => {
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
          href={(options.linkRenderer ? options.linkRenderer(value) : '#')}
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
          onClick={options.clickHandler}
        >
          {value}
        </Button>
      );
      break;
    case 'badge':
      valueRenderer = value => (<Badge count={value} />);
      break;
    case 'dot':
      valueRenderer = value => (<Badge status={options.statusRenderer(value)} text={value} />);
      break;
    case 'custom':
      valueRenderer = value => options.componentRenderer(value, key, options);
      break;
  }

  return (row) => {
    const value = dataSet[row] ? dataSet[row][key] : '';
    return (
      <Cell data-row={row} data-key={key} data-value={value}>{valueRenderer(value)}</Cell>
    );
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

    const reorderedColumns = Utils.reorderArray(columns, oldIndex, newIndex, length);
    reorderColumnsCallback(reorderedColumns);
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
        { columns.map(column => (column)) }
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
  renderMode: RenderMode.BATCH_ON_UPDATE,
  enableGhostCells: true,
  enableReordering: true,
  enableResizing: true,
  renderContextMenu: () => {},
  reorderColumnsCallback: () => {},
};

export default TableBody;
