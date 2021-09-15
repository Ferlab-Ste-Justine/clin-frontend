/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
import React from 'react';
import { Layout } from 'antd';
import intl from 'react-intl-universal';
import { createBrowserHistory } from 'history';
import SidebarMenu, { ISidebarMenuItem } from '@ferlab/ui/core/components/sidebarMenu';
import { useFilters } from '@ferlab/ui/core/data/filters/utils';
import QueryBuilder from '@ferlab/ui/core/components/QueryBuilder';
import ScrollView from '@ferlab/ui/core/layout/ScrollView';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';
import LineStyleIcon from '../../icons/LineStyleIcon';

import styles from './PatientVariant.module.scss';

const history = createBrowserHistory();

const PatientVariantScreen = () => {
  const { filters } = useFilters();
  const dictionary = {};
  const results = {
    loading: false,
    total: 1000,
  };
  const { total } = results;

  const menuItems: ISidebarMenuItem[] = [
    {
      key: '1',
      title: intl.get('screen.patientvariant.category_variant'),
      icon: <LineStyleIcon />,
      panelContent: <>Variants Filters</>,
    },
    {
      key: '2',
      title: intl.get('screen.patientvariant.category_genomic'),
      icon: <LineStyleIcon />,
      panelContent: <>Genes Filters</>,
    },
    {
      key: '3',
      title: intl.get('screen.patientvariant.category_impacts'),
      icon: <LineStyleIcon />,
      panelContent: <>Impacts Filters</>,
    },
    {
      key: '4',
      title: intl.get('screen.patientvariant.category_cohort'),
      icon: <LineStyleIcon />,
      panelContent: <>Frequency Filters</>,
    },
    {
      key: '5',
      title: intl.get('screen.patientvariant.category_metric'),
      icon: <LineStyleIcon />,
      panelContent: <>Metriques</>,
    },
  ];

  return (
    <Layout className={styles.patientVariantLayout}>
      <SidebarMenu className={styles.patientVariantSidebar} menuItems={menuItems} />
      <ScrollView className={styles.scrollContent}>
        <StackLayout vertical className={styles.pageContainer}>
          <QueryBuilder
            className="variant-repo__query-builder"
            showHeader={true}
            headerTitle="Variant Query"
            showHeaderTools={true}
            cacheKey="patient-variant-repo"
            enableCombine={true}
            currentQuery={filters?.content?.length ? filters : {}}
            history={history}
            loading={results.loading}
            total={total}
            dictionary={dictionary}
          />
        </StackLayout>
      </ScrollView>
    </Layout>
  );
};

export default PatientVariantScreen;
