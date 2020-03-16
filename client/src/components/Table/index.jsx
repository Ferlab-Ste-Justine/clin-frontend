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
import IconKit from 'react-icons-kit';
import {
  ic_info_outline,
} from 'react-icons-kit/md';
import './style.scss';


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
      case 'capitalText':
        valueRenderer = value => (
          <Typography.Text {...options.style} type={options.type} className="capitalText" ellipsis>{value}</Typography.Text>);
        break;
      case 'link':
        valueRenderer = value => (
          <a
            type="link"
            href={(options.renderer ? options.renderer(value) : '#')}
            className="link"
          >
            {value}
          </a>
        );
        break;
      case 'wrapTextLink':
        valueRenderer = value => (
          <div className="wrapTextLinkContainer">
            <a
              type="link"
              href={(options.renderer ? options.renderer(value) : '#')}
              className="wrapTextLink"
            >
              {value}
            </a>
          </div>
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
            className="button"
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
          <Cell className="cellValue">
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
  let { rowHeight } = props;
  const rowsCount = size <= total ? size : total;
  const handleColumnsReordered = (oldIndex, newIndex, length) => {
    if (oldIndex === newIndex) {
      return;
    }

    reorderColumnsCallback(Utils.reorderArray(columns, oldIndex, newIndex, length));
  };
  rowHeight = rowsCount === 0 ? [] : rowHeight;
  if (rowsCount < rowHeight.length) {
    rowHeight = rowHeight.slice(0, rowsCount);
  }
  if (rowHeight.length < rowsCount) {
    const bufferArray = Array(rowsCount - rowHeight.length).fill(36);
    rowHeight = [...rowHeight, ...bufferArray];
  }
  // eslint-disable-next-line no-unused-vars
  const handleOnMouseOver = () => {
    console.log('coucou');
  };
  // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
  const renderColumnHeader = (name, index) => (<div className="tooltipHeader">{intl.get(columns[index].label)} <IconKit size={16} icon={ic_info_outline} /></div>);
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
      rowHeights={rowHeight}
      getCellClipboardData={copyCallback}
      columnWidths={columnWidth}
    >
      { columns.map(definition => (
        <Column
          id={definition.key}
          name={definition.description ? definition.description : intl.get(definition.label)}
          cellRenderer={definition.renderer}
          nameRenderer={definition.description ? renderColumnHeader : null}
          onMouseOver={() => { console.log('test'); }}
          onFocus={() => undefined}
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
  rowHeight: PropTypes.shape([]),
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
  rowHeight: [],
};

export default DataTable;
