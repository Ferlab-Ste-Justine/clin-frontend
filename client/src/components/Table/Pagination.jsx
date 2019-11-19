import React from 'react';
import PropTypes from 'prop-types';
import { Pagination, Spin } from 'antd';

import './style.scss';


const TablePagination = (props) => {
  const {
    isLoading, total, page, defaultPage, size, defaultSize, sizeOptions, canChangeSize, isDisabled, pageChangeCallback, sizeChangeCallback,
  } = props;

  return (
    <Spin spinning={isLoading}>
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
    </Spin>
  );
};

TablePagination.propTypes = {
  total: PropTypes.number,
  page: PropTypes.number,
  size: PropTypes.number,
  defaultPage: PropTypes.number,
  defaultSize: PropTypes.number,
  sizeOptions: PropTypes.shape([]),
  canChangeSize: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isLoading: PropTypes.bool,
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
  isLoading: false,
  pageChangeCallback: () => {},
  sizeChangeCallback: () => {},
};

export default TablePagination;
