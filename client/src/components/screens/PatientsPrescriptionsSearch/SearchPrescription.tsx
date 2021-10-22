import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { getQueryBuilderCache, useFilters } from '@ferlab/ui/core/data/filters/utils';
import { resolveSyntheticSqon } from '@ferlab/ui/core/data/sqon/utils';
import ScrollView from '@ferlab/ui/core/layout/ScrollView';
import StackLayout, { StackOrientation } from '@ferlab/ui/core/layout/StackLayout'
import { Typography } from 'antd';

import { usePrescription, usePrescriptionMapping  } from 'store/graphql/prescriptions/actions';

import ContentContainer from './ContentContainer';
import Sidebar from './SidebarPrescription';

import styles from './SearchPrescription.module.scss';
const { Title } = Typography;

export const MAX_NUMBER_RESULTS = 1000;

const PrescriptionSearch = (): React.ReactElement => {
  const { filters: sqonFilters } = useFilters();
  const allSqons = getQueryBuilderCache('prescription-repo').state;
  const [currentPage, setCurrentPage] = useState(1);

  const results = usePrescription({
    first: MAX_NUMBER_RESULTS,
    offset: 0,
    sqon: resolveSyntheticSqon(allSqons, sqonFilters),
  });
  const extendedMapping = usePrescriptionMapping();

  return (
    <StackLayout orientation={StackOrientation.Vertical}>
      <div className="page_headerStaticNoMargin">
        <div className="variant-page-content__header">
          <Title level={3}>{ intl.get('screen.patientsearch.title') }</Title>
        </div>
      </div>
      <StackLayout className={styles.layout} orientation={StackOrientation.Horizontal}>
        <Sidebar
          extendedMapping={extendedMapping}
          filters={sqonFilters}
          results={results}
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
              results={results}
            />
          </div>
        </ScrollView>
      </StackLayout>
    </StackLayout>
  );
};

export default PrescriptionSearch;
