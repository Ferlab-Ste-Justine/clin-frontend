import React, { useState } from 'react';
import { Table } from 'antd';

import style from './VariantTableContainer.module.scss';

const DEFAULT_PAGE_NUM = 1;

type OwnProps = {
  setCurrentPageCb: (currentPage: number) => void;
};

const VariantTableContainer = (props: OwnProps) => {
  const { setCurrentPageCb } = props;
  const [currentPageNum, setCurrentPageNum] = useState(DEFAULT_PAGE_NUM);

  const total = 0;

  return (
    <Table
      pagination={{
        current: currentPageNum,
        total,
        onChange: (page) => {
          if (currentPageNum !== page) {
            setCurrentPageNum(page);
            setCurrentPageCb(page);
          }
        },
        size: 'small',
      }}
      className={style.variantSearchTable}
      loading={false}
      dataSource={[]}
      columns={[]}
    />
  );
};

export default VariantTableContainer;
