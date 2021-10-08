import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom";
import { InfoCircleFilled } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';
import QueryBuilder from '@ferlab/ui/core/components/QueryBuilder';
import { IDictionary } from '@ferlab/ui/core/components/QueryBuilder/types';
import { ISyntheticSqon } from '@ferlab/ui/core/data/sqon/types';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';
import {
  autoCompletePatients,
} from 'actions/patient';
import { AutoComplete, Input, TablePaginationConfig } from 'antd';

import PatientCreation from 'components/screens/PatientCreation';
import { ExtendedMappingResults } from 'store/graphql/prescriptions/actions';
import { Results } from 'store/graphql/prescriptions/models';
import { ExtendedMapping } from 'store/graphql/utils/Filters';

import PrescriptionsTable from './table';

import styles from './ContentContainer.module.scss';

export type PrescriptionResultsContainerProps = {
  results: Results;
  extendedMapping: ExtendedMappingResults;
  filters: ISyntheticSqon;
  pagination: TablePaginationConfig;
};

const ContentContainer = ({
  extendedMapping,
  filters,
  pagination,
  results
}: PrescriptionResultsContainerProps): React.ReactElement => {
  const total = results?.data?.hits?.total || 0;
  const history = useHistory();
  const dispatch = useDispatch()
  const dictionary: IDictionary = {
    query: {
      facet: (key) =>
      extendedMapping?.data.find((filter: ExtendedMapping) => key === filter.field)
          ?.displayName || key,
    },
  };

  return (
    <StackLayout className={styles.containerLayout} vertical>
      <StackLayout horizontal>
        <AutoComplete
          allowClear
          autoFocus
          className="autocomplete"
          defaultActiveFirstOption={false}
          onChange={() => {
            dispatch(autoCompletePatients('partial', null, 1, 25));
          }}
          options={
            results.data?.hits.edges.map(
              (v:any) => ({ label: v.node.cid, value: v.node.status })
            )
          }
          style={{ width: '100%' }}
        >
          <Input
            placeholder={intl.get('screen.patientsearch.placeholder')}
            prefix={
              <SearchOutlined />
            }
          />
        </AutoComplete>
        <PatientCreation />
      </StackLayout>
      <QueryBuilder
        IconTotal={<InfoCircleFilled className={styles.queryBuilderIcon} />}
        cacheKey="study-repo"
        className="file-repo__query-builder"
        currentQuery={filters?.content?.length ? filters : {}}
        dictionary={dictionary}
        enableCombine={true}
        history={history}
        loading={results?.loading}
        total={total}
      />
      <StackLayout className={styles.tableContainer} vertical>
        <PrescriptionsTable
          pagination={pagination}
          results={results}
          total={total}
        />
      </StackLayout>
    </StackLayout>
  );
};

export default ContentContainer;
