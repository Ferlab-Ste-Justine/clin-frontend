/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-curly-spacing */

import React, { useState } from 'react';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ISyntheticSqon } from '@ferlab/ui/core/data/sqon/types';
import { VariantPageResults } from './VariantPageContainer';

import '../../../../../../node_modules/@ant-design/pro-table/dist/table.css';
import style from './VariantTableContainer.module.scss';

const DEFAULT_PAGE_NUM = 1;
const DEFAULT_PAGE_SIZE = 10;

type OwnProps = {
  results: VariantPageResults;
  filters: ISyntheticSqon;
  setCurrentPageCb: (currentPage: number) => void;
  currentPageSize: number;
  setcurrentPageSize: (currentPage: number) => void;
};

const columns: ProColumns[] = [
  {
    title: 'test1',
    dataIndex: 'test1',
  },
  {
    title: 'test2',
    dataIndex: 'test2',
  },
  {
    title: 'test3',
    dataIndex: 'test3',
  },
  {
    title: 'test4',
    dataIndex: 'test4',
  },
];

const defaultData = [
  {
    test1: 'Allo',
    test2: 'Allo',
    test3: 'Allo',
    test4: 'Allo',
  },
];

const VariantTableContainer = (props: OwnProps) => {
  const { results, setCurrentPageCb, currentPageSize, setcurrentPageSize } = props;
  const [currentPageNum, setCurrentPageNum] = useState(DEFAULT_PAGE_NUM);
  const total = 0;

  return (
    <ProTable
      columns={columns}
      search={false}
      toolbar={{
        title: (
          <div className={style.tabletotalTitle}>
            Résultats <strong>1 - {DEFAULT_PAGE_SIZE}</strong> sur <strong>200</strong>
          </div>
        ),
      }}
      defaultData={defaultData}
      className={style.variantSearchTable}
      options={{
        density: false,
        reload: false,
      }}
      cardBordered={true}
      pagination={{
        current: currentPageNum,
        showTotal: () => undefined,
        showTitle: false,
        showSizeChanger: false,
        showQuickJumper: false,
        onChange: (page) => {
          if (currentPageNum !== page) {
            setCurrentPageNum(page);
            setCurrentPageCb(page);
          }
        },
        size: 'small',
      }}
    />
  );
};

export default VariantTableContainer;
