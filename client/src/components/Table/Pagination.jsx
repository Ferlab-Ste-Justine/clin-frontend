import shortid from 'shortid';
import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';


const DataTablePagination = (props) => {
  const {
    total, page, defaultPage, size, defaultSize, sizeOptions, canChangeSize, isDisabled, pageChangeCallback, pageSizeChangeCallback,
  } = props;

  return (
    <Pagination
      key={shortid.generate()}
      total={total}
      current={page}
      pageSize={size}
      defaultCurrent={defaultPage}
      defaultPageSize={defaultSize}
      pageSizeOptions={sizeOptions}
      showSizeChanger={canChangeSize}
      disabled={isDisabled}
      onChange={pageChangeCallback}
      onShowSizeChange={pageSizeChangeCallback}
    />
  );
};

DataTablePagination.propTypes = {
  total: PropTypes.number,
  page: PropTypes.number,
  size: PropTypes.number,
  defaultPage: PropTypes.number,
  defaultSize: PropTypes.number,
  sizeOptions: PropTypes.shape([]),
  canChangeSize: PropTypes.bool,
  isDisabled: PropTypes.bool,
  pageChangeCallback: PropTypes.func,
  pageSizeChangeCallback: PropTypes.func,
};

DataTablePagination.defaultProps = {
  total: 0,
  page: 1,
  size: 25,
  defaultPage: 1,
  defaultSize: 25,
  sizeOptions: ['25', '50', '100', '250', '500', '1000'],
  canChangeSize: true,
  isDisabled: false,
  pageChangeCallback: () => {},
  pageSizeChangeCallback: () => {},
};

export default DataTablePagination;
