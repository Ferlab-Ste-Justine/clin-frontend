/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-curly-spacing */

import React, { useState } from 'react';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ISyntheticSqon } from '@ferlab/ui/core/data/sqon/types';
import { VariantPageResults } from './VariantPageContainer';
import intl from 'react-intl-universal';

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

const GeneTableContainer = (props: OwnProps) => {
  const { results, setCurrentPageCb, currentPageSize, setcurrentPageSize } = props;
  const [currentPageNum, setCurrentPageNum] = useState(DEFAULT_PAGE_NUM);
  const total = 0;

  const columns: ProColumns[] = [
    {
      title: intl.get('screen.patientvariant.results.gene.table.symbol'),
      dataIndex: 'test1',
    },
    {
      title: intl.get('screen.patientvariant.results.gene.table.name'),
      dataIndex: 'test2',
    },
    {
      title: intl.get('screen.patientvariant.results.gene.table.omim_id'),
      dataIndex: 'test3',
    },
    {
      title: 'test4',
      dataIndex: 'test4',
    },
    {
      title: 'test5',
      dataIndex: 'test5',
    },
  ];
  
  const defaultData = [
    {
      test1: 'Allo',
      test2: 'Allo',
      test3: 'Allo',
      test4: 'Allo',
      test5: 'Allo',
    },
  ];

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
        setting: false,
      }}
      cardBordered={true}
      pagination={{
        current: currentPageNum,
        showTotal: () => undefined,
        showTitle: false,
        showSizeChanger: true,
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

export default GeneTableContainer;
