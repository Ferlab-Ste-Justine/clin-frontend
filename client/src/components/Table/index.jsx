import React from 'react';
import PropTypes from 'prop-types';
import {
  Column, Table, Utils, Cell, RenderMode,
} from '@blueprintjs/table';

import './style.scss';


const TableHeader = (props) => {
  return (
    <div>Table Header</div>
  );
};

const TableFooter = (props) => {
  return (
    <div>Table Footer</div>
  );
};

const TableFooter = (props) => {
  return (
    <div>Table Footer</div>
  );
};

TableHeader.propTypes = {
  total: PropTypes.number,
  page: PropTypes.number,
  size: PropTypes.number,
  handlePageChange: PropTypes.func,
  handleSizeChange: PropTypes.func,
};

TableHeader.defaultProps = {
  total: 0,
  page: 1,
  size: 25,
  handlePageChange: () => {},
  handleSizeChange: () => {},
};

export default TableHeader;
