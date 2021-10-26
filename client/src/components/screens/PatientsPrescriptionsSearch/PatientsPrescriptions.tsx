import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { getQueryBuilderCache, useFilters } from '@ferlab/ui/core/data/filters/utils';
import { resolveSyntheticSqon } from '@ferlab/ui/core/data/sqon/utils';
import ScrollView from '@ferlab/ui/core/layout/ScrollView';
import StackLayout, { StackOrientation } from '@ferlab/ui/core/layout/StackLayout'
import { Typography } from 'antd';

import { GqlResults } from 'store/graphql/models';
import {
  usePatients,
} from 'store/graphql/patients/actions';
import { PatientResult } from 'store/graphql/patients/models/Patient';
import {
  usePrescription,
  usePrescriptionMapping
} from 'store/graphql/prescriptions/actions';

import { TableTabs } from './ContentContainer'
import ContentContainer from './ContentContainer';
import Sidebar from './Sidebar';

import styles from './PatientsPrescriptions.module.scss';
const { Title } = Typography;

export const MAX_NUMBER_RESULTS = 1000;

const PrescriptionSearch = (): React.ReactElement => {
  const { filters: sqonFilters } = useFilters();
  const allSqons = getQueryBuilderCache('prescription-repo').state;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState(TableTabs.Patients);
  const arrangerQueryConfig = {first: MAX_NUMBER_RESULTS,
    offset: 0,
    sqon: resolveSyntheticSqon(allSqons, sqonFilters),
  }
  const searchResults = usePatients(arrangerQueryConfig);
  const prescriptions = usePrescription(arrangerQueryConfig);
  const extendedMapping = usePrescriptionMapping();
  const patients = usePatients(arrangerQueryConfig);

  return (
    <StackLayout orientation={StackOrientation.Vertical}>
      <div className="page_headerStaticNoMargin">
        <div className="variant-page-content__header">
          <Title level={3}>{ intl.get('screen.patientsearch.title') }</Title>
        </div>
      </div>
      <StackLayout className={styles.layout} orientation={StackOrientation.Horizontal}>
        <Sidebar
          aggregations={prescriptions.aggregations}
          extendedMapping={extendedMapping}
          filters={sqonFilters}
          results={prescriptions.data}
        />
        <ScrollView className={styles.scrollContent}>
          <div title="Studies">
            <ContentContainer
              extendedMapping={extendedMapping}
              filters={sqonFilters.filters}
              pagination={{
                current: currentPage,
                onChange: (page, pageSize) => setCurrentPage(page),
              }}
              patients={patients}
              prescriptions={prescriptions}
              searchResults={searchResults}
              tabs={{
                currentTab,
                setCurrentTab
              }}
            />
          </div>
        </ScrollView>
      </StackLayout>
    </StackLayout>
  );
};

export default PrescriptionSearch;
