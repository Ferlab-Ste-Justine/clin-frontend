import shortid from 'shortid';
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import {
  Table, Cell, RenderMode, Column, Utils, SelectionModes,
} from '@blueprintjs/table';

import {
  Badge, Button, Typography, Checkbox, Tooltip,
} from 'antd';
import { cloneDeep } from 'lodash';
import IconKit from 'react-icons-kit';
import {
  ic_info_outline,
} from 'react-icons-kit/md';
import './style.scss';
// import { relativeTimeThreshold } from 'moment';

// https://github.com/warpech/sheetclip

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
      case 'tooltipButton':
        valueRenderer = value => (
          <Tooltip title={options.label || value} mouseEnterDelay={1}>
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
          </Tooltip>
        );
        break;
      case 'badge':
        valueRenderer = value => (<Badge count={value} />);
        break;
      case 'dot':
        valueRenderer = value => (<Badge className="badge" color={options.renderer(value)} text={value} />);
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

class DataTable extends React.Component {
  constructor(props) {
    super(props);

    this.copyCallback = this.copyCallback.bind(this);
    this.selectionCallback = this.selectionCallback.bind(this);
    this.regionSelectedArray = [];
  }

  copyCallback() {
    if (this.regionSelectedArray) {
      const copyTextToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
        }, (err) => {
          console.log('Could not copy text: ', err);
        });
      };
      const copyArrayToClipboard = (array) => {
        let csv = '';
        array.forEach((row, rowIdx) => {
          row.forEach((cell, cellIdx) => {
            csv += (`${cell}`).replace(/[\n\t]+/g, ' ');
            if (cellIdx + 1 < row.length) csv += '\t';
          });
          if (rowIdx + 1 < array.length) csv += '\n';
        });
        copyTextToClipboard(csv);
      };

      copyArrayToClipboard(this.regionSelectedArray);
    }
  }

  selectionCallback(sel) {
    const {
      getData,
    } = this.props;

    const {
      columns,
    } = this.props;

    const selection = sel[0];
    if (selection) {
      const rowStart = selection.rows ? selection.rows[0] : 0;
      const rowEnd = selection.rows ? selection.rows[selection.rows.length - 1] : getData.length - 1;
      const colStart = selection.cols ? selection.cols[0] : 0;
      const colEnd = selection.cols ? selection.cols[selection.cols.length - 1] : columns.length - 1;

      const array = [];
      for (let row = rowStart; row <= rowEnd; row += 1) {
        const newRow = [];
        for (let col = colStart; col <= colEnd; col += 1) {
          const renderer = columns[col].excelRenderer;
          if (renderer) {
            const output = (`${renderer(getData()[row])}`).replace(/[\n\t]+/g, ' ');
            newRow.push(output);
          }
        }
        array.push(newRow);
      }

      this.regionSelectedArray = array;
    }
  }

  render() {
    const {
      columns,
      size,
      total,
      enableReordering,
      enableResizing,
      renderContextMenuCallback,
      reorderColumnsCallback,
      resizeColumnCallback,
      numFrozenColumns,
      enableGhostCells,
      enableRowHeader,
    } = this.props;
    let { rowHeight } = this.props;
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
      const bufferArray = Array(rowsCount - rowHeight.length).fill(32);
      rowHeight = [...rowHeight, ...bufferArray];
    }
    const renderColumnHeader = (name, index) => (
      <div className="tooltipHeader">{intl.get(columns[index].label)} <IconKit size={16} icon={ic_info_outline} /></div>
    );

    const getColumnTitle = (label) => {
      if (label === 'Select') {
        return (
          <Checkbox
            className="checkbox checkboxTitle"
            disabled
          />
        );
      }
      return intl.get(label);
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
        rowHeights={rowHeight}
        getCellClipboardData={(row, col) => `(${row}, ${col})`}
        columnWidths={columns.map(c => c.columnWidth)}
        enableRowHeader={enableRowHeader}
        selectionMode={SelectionModes.ROWS_AND_CELLS}
        // selectionMode={SelectionModes.NONE}
        onCopy={this.copyCallback}
        onSelection={this.selectionCallback}
      >
        { columns.map(definition => (
          <Column
            id={definition.key}
            name={definition.description ? definition.description : getColumnTitle(definition.label)}
            cellRenderer={definition.renderer}
            nameRenderer={definition.description ? renderColumnHeader : null}
          />
        )) }
      </Table>
    );
  }
}

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
  getData: PropTypes.func,
  rowHeight: PropTypes.shape([]),
  enableRowHeader: PropTypes.bool,
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
  getData: () => {},
  rowHeight: [],
  enableRowHeader: true,
};

export default DataTable;
