import React from 'react';
import { useSelector } from 'react-redux'
import { Table, TablePaginationConfig } from 'antd';
import { State } from 'reducers';
import { PrescriptionState } from 'reducers/prescriptionsGraphql';

import { TableItemsCount } from 'components/screens/PatientSearch/components/TableItemsCount';
import { GqlResults } from 'store/graphql/prescriptions/models';

import { prescriptionsColumns } from './prescriptionColumns';

import styles from './index.module.scss';

type Props =  {
  results: GqlResults,
  total: number,
  pagination: TablePaginationConfig
};

const ITEM_PER_PAGE = 25;

const PrescriptionTable = ({ pagination, results, total }: Props): React.ReactElement => {
  const prescriptionState: PrescriptionState = useSelector((state: State) => state.prescriptionsGraphql);
  const columns = prescriptionsColumns(prescriptionState.sqons);

  return (
    <div>
      <TableItemsCount
        className={styles.headerInfo}
        page={pagination.current || 1}
        size={ITEM_PER_PAGE}
        total={total}
      />
      <Table
        className={styles.table}
        columns={columns}
        dataSource={results.data || []}
        pagination={{
          ...pagination,
          pageSize: ITEM_PER_PAGE,
          position: ['bottomLeft']
        }}
      />
    </div>
  );
};

export default PrescriptionTable;
