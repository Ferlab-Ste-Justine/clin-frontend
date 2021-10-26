import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useHistory } from "react-router-dom";
import { InfoCircleFilled } from '@ant-design/icons';
import QueryBuilder from '@ferlab/ui/core/components/QueryBuilder';
import { IDictionary } from '@ferlab/ui/core/components/QueryBuilder/types';
import { ISyntheticSqon } from '@ferlab/ui/core/data/sqon/types';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';
import {
  TablePaginationConfig,
  Tabs,
} from 'antd';

import { GqlResults } from 'store/graphql/models';
import { ExtendedMapping, ExtendedMappingResults } from 'store/graphql/models';
import { PatientResult } from 'store/graphql/patients/models/Patient';
import { PrescriptionResult } from 'store/graphql/prescriptions/models/Prescription';

import PatientsTable from './table/PatientsTable';
import PrescriptionsTable from './table/PrescriptionsTable';
import ContentHeader from './ContentHeader';

import styles from './ContentContainer.module.scss';

const { TabPane } = Tabs;

export enum TableTabs {
  Patients = 'patients',
  Prescriptions = 'prescriptions'
}
export type PrescriptionResultsContainerProps = {
  prescriptions: GqlResults<PrescriptionResult>;
  extendedMapping: ExtendedMappingResults;
  filters: ISyntheticSqon;
  pagination: TablePaginationConfig;
  patients: GqlResults<PatientResult> | null;
  searchResults: GqlResults<PatientResult> | null;
  tabs: {
    currentTab: TableTabs,
    setCurrentTab: (t: TableTabs) => void
  }
};

const ContentContainer = ({
  extendedMapping,
  filters,
  pagination,
  patients,
  prescriptions,
  searchResults,
  tabs
}: PrescriptionResultsContainerProps): React.ReactElement => {
  const total = prescriptions.total || 0;
  const history = useHistory();
  const dictionary: IDictionary = {
    query: {
      facet: (key) =>
        extendedMapping?.data.find((filter: ExtendedMapping) => key === filter.field)
          ?.displayName || key,
    },
  };

  return (
    <StackLayout className={styles.containerLayout} vertical>
      <ContentHeader searchResults={searchResults} />
      <QueryBuilder
        IconTotal={<InfoCircleFilled className={styles.queryBuilderIcon} />}
        cacheKey="study-repo"
        className="file-repo__query-builder"
        currentQuery={filters?.content?.length ? filters : {}}
        dictionary={dictionary}
        enableCombine={true}
        history={history}
        loading={prescriptions?.loading}
        total={total}
      />
      <StackLayout className={styles.tableContainer} vertical>
        <Tabs onChange={(v) => tabs.setCurrentTab(v as TableTabs)}>
          <TabPane key={TableTabs.Patients} tab={intl.get('header.navigation.patient')}>
            <PatientsTable
              pagination={pagination}
              results={patients}
              total={total}
            />
          </TabPane>
          <TabPane key={TableTabs.Prescriptions} tab={intl.get('screen.patient.tab.prescriptions')}>
            <PrescriptionsTable
              pagination={pagination}
              results={patients}
              total={total}
            />
          </TabPane>
        </Tabs>
      </StackLayout>
    </StackLayout>
  );
};

export default ContentContainer;
