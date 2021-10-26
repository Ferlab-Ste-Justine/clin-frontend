import React from 'react';
import { useSelector } from 'react-redux'
import { State } from 'reducers';
import { PrescriptionState } from 'reducers/prescriptionsGraphql';

import { patientsColumns } from './patientsColumns';
import Table, { Props } from './Table';

const PatientsTable = ({ pagination, results, total }: Props): React.ReactElement => {
  const prescriptionState: PrescriptionState = useSelector((state: State) => state.prescriptionsGraphql);
  const columns = patientsColumns(prescriptionState.sqons);

  return (
    <Table
      columns={columns}
      pagination={pagination}
      results={results}
      total={total}
    />
  );
};

export default PatientsTable;
