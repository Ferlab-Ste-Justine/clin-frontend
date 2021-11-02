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
import { Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import {
  VariantEntity,
  VariantEntityNode,
  ClinVar,
  Consequence,
} from 'store/graphql/variants/models';
import { DISPLAY_WHEN_EMPTY_DATUM } from './Empty';
import ConsequencesCell from './ConsequencesCell';

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

const makeRows = (rows: VariantEntityNode[]) =>
  rows.map((row: VariantEntityNode, index: number) => ({ ...row.node, key: `${index}` }));

const VariantTableContainer = (props: OwnProps) => {
  const { results, setCurrentPageCb, currentPageSize, setcurrentPageSize } = props;
  const [currentPageNum, setCurrentPageNum] = useState(DEFAULT_PAGE_NUM);

  const nodes = results.data?.Variants?.hits?.edges || [];
  const variants = nodes as VariantEntityNode[];
  const total = results.data?.Variants?.hits.total || 0;

  const columns: ProColumns[] = [
    {
      title: intl.get('screen.patientvariant.results.table.variant'),
      dataIndex: 'hgvsg',
      render: (hgvsg, entity: VariantEntity) =>
        hgvsg ? (
          <Tooltip placement="topLeft" title={hgvsg}>
            <Link to={`/variantDetails/${entity.hash}`} href={'#top'}>
              {hgvsg}
            </Link>
          </Tooltip>
        ) : (
          DISPLAY_WHEN_EMPTY_DATUM
        ),
    },
    {
      title: intl.get('screen.patientvariant.results.table.type'),
      dataIndex: 'variant_class',
    },
    {
      title: intl.get('screen.patientvariant.results.table.dbsnp'),
      dataIndex: 'rsnumber',
      render: (rsNumber) =>
        rsNumber ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.ncbi.nlm.nih.gov/snp/${rsNumber}`}
          >
            {rsNumber}
          </a>
        ) : (
          DISPLAY_WHEN_EMPTY_DATUM
        ),
    },
    {
      title: intl.get('screen.patientvariant.results.table.consequence'),
      dataIndex: 'consequences',
      width: 300,
      render: (consequences) => {
        const consequencesData = consequences as { hits: { edges: Consequence[] } };
        return <ConsequencesCell consequences={consequencesData?.hits?.edges || []} />;
      },
    },
    {
      title: intl.get('screen.patientvariant.results.table.clinvar'),
      dataIndex: 'clinvar',
      render: (clinVar) => {
        const clinVarData = clinVar as ClinVar;
        return clinVarData?.clin_sig && clinVarData.clinvar_id ? (
          <a
            href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${clinVarData.clinvar_id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {clinVarData.clin_sig.join(', ')}
          </a>
        ) : (
          DISPLAY_WHEN_EMPTY_DATUM
        );
      },
    },
    {
      title: intl.get('screen.variantsearch.table.gnomAd'),
      dataIndex: 'test6',
    },
    {
      title: intl.get('screen.patientvariant.results.table.rqdm'),
      dataIndex: 'test7',
    },
    {
      title: intl.get('screen.patientvariant.results.table.zygosity'),
      dataIndex: 'test8',
    },
    {
      title: intl.get('screen.patientvariant.results.table.transmission'),
      dataIndex: 'test9',
    },
  ];

  return (
    <ProTable
      loading={results.loading}
      columns={columns}
      search={false}
      toolbar={{
        title: (
          <div className={style.tabletotalTitle}>
            Résultats <strong>1 - {DEFAULT_PAGE_SIZE}</strong> sur <strong>{total}</strong>
          </div>
        ),
      }}
      dataSource={makeRows(variants)}
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
        total: total,
        showTitle: false,
        showSizeChanger: true,
        showQuickJumper: false,
        defaultPageSize: currentPageSize,
        onChange: (page, pageSize) => {
          if (currentPageNum !== page || currentPageSize !== pageSize) {
            setCurrentPageNum(page);
            setCurrentPageCb(page);
            setcurrentPageSize(pageSize || DEFAULT_PAGE_SIZE);
          }
        },
        size: 'small',
      }}
    />
  );
};

export default VariantTableContainer;
