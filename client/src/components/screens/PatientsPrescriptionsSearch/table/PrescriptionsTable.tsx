import React from 'react';
import { useSelector } from 'react-redux'
import { State } from 'reducers';
import { PrescriptionState } from 'reducers/prescriptionsGraphql';

import { prescriptionsColumns } from './prescriptionColumns';
import Table, { Props } from './Table';

const PrescriptionsTable = ({ pagination, results, total }: Props): React.ReactElement => {
  const prescriptionState: PrescriptionState = useSelector((state: State) => state.prescriptionsGraphql);
  const columns = prescriptionsColumns(prescriptionState.sqons);

  return (
    <Table
      columns={columns}
      pagination={pagination}
      results={results}
      total={total}
    />
  );
};

export default PrescriptionsTable;
