import React from 'react';
import intl from 'react-intl-universal';
import { Table as AntTable, TablePaginationConfig, Typography } from 'antd';

import { GqlResults } from 'store/graphql/models';
import { PatientResult } from 'store/graphql/patients/models/Patient';
import { PrescriptionResult } from 'store/graphql/prescriptions/models/Prescription';

import { TColumn } from './columns';

import styles from './table.module.scss';

const TableItemsCount = ({
  className,
  page,
  size,
  total,
}: {
  className?: string;
  page: number;
  size: number;
  total: number;
}): React.ReactElement => {
  const from = (page - 1) * size + 1;
  const to = from + size - 1;
  const itemsCount = (      <>
    <Typography.Text strong> { from }-{ to }
    </Typography.Text>
    <Typography.Text> { intl.get('screen.patientsearch.headers.count.of') }
    </Typography.Text>
    <Typography.Text strong> { total }
    </Typography.Text>
  </>);

  return className ?
    <div className={className}>{itemsCount}</div> :
    itemsCount;
};

export type Props =  {
  results: GqlResults<PrescriptionResult|PatientResult> | null,
  total: number,
  pagination: TablePaginationConfig
};

type TableProps = Props & {
  columns: TColumn[],
};

const ITEM_PER_PAGE = 25;

const Table = ({ columns, pagination, results, total }: TableProps): React.ReactElement => (
  <>
    <TableItemsCount
      className={styles.headerInfo}
      page={pagination.current || 1}
      size={ITEM_PER_PAGE}
      total={total}
    />
    <AntTable
      className={styles.table}
      columns={columns}
      dataSource={results?.data || []}
      pagination={{
        ...pagination,
        pageSize: ITEM_PER_PAGE,
        position: ['bottomLeft']
      }}
    />
  </>
);

export default Table;
