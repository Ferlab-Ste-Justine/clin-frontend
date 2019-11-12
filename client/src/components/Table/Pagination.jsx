import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';

import './style.scss';


const TablePagination = (props) => {
  const {
    total, page, defaultPage, size, defaultSize, sizeOptions, canChangeSize, isDisabled, pageChangeCallback, sizeChangeCallback,
  } = props;

  return (
    <Pagination
      total={total}
      current={page}
      pageSize={size}
      defaultCurrent={defaultPage}
      defaultPageSize={defaultSize}
      pageSizeOptions={sizeOptions}
      showSizeChanger={canChangeSize}
      disabled={isDisabled}
      onChange={pageChangeCallback}
      onShowSizeChange={sizeChangeCallback}
    />
  );
};

TablePagination.propTypes = {
  total: PropTypes.number,
  page: PropTypes.number,
  size: PropTypes.number,
  defaultPage: PropTypes.number,
  defaultSize: PropTypes.number,
  sizeOptions: PropTypes.shape([]),
  isDisabled: PropTypes.bool,
  canChangeSize: PropTypes.bool,
  pageChangeCallback: PropTypes.func,
  sizeChangeCallback: PropTypes.func,
};

TablePagination.defaultProps = {
  total: 0,
  page: 1,
  size: 25,
  defaultPage: 1,
  defaultSize: 25,
  sizeOptions: [25, 50, 100, 250, 500, 1000],
  canChangeSize: true,
  isDisabled: false,
  pageChangeCallback: () => {},
  sizeChangeCallback: () => {},
};

export default TablePagination;
