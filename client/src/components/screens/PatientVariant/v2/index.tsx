/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
import React from 'react';
import intl from 'react-intl-universal';
import SidebarMenu, { ISidebarMenuItem } from '@ferlab/ui/core/components/sidebarMenu';
import ScrollView from '@ferlab/ui/core/layout/ScrollView';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';
import LineStyleIcon from 'components/icons/LineStyleIcon';
import GeneIcon from 'components/icons/GeneIcon';
import DiseaseIcon from 'components/icons/DiseaseIcon';
import FrequencyIcon from 'components/icons/FrequencyIcon';
import OccurenceIcon from 'components/icons/OccurenceIcon';
import VariantPageContainer from './VariantPageContainer';
import VariantFilters from './filters/VariantFilters';
import GeneFilters from './filters/GeneFilters';
import MetricFilters from './filters/MetricFilters';
import FrequencyFilters from './filters/FrequencyFilter';
import PathogenicityFilters from './filters/PathogenicityFilters';
import InheritanceFilters from './filters/InheritanceFilters';
import { MappingResults, useGetExtendedMappings } from 'store/graphql/utils/actions';
import { VARIANT_INDEX } from 'components/screens/PatientVariant/v2/constants';

import styles from './PatientVariant.module.scss';
import { Spin } from 'antd';

const DEFAULT_PAGE_NUM = 1;

enum FilterTypes {
  Variant,
  Gene,
  Pathogenicity,
  Frequency,
  Inheritance,
  Metric,
}

const filtersContainer = (mappingResults: MappingResults, type: FilterTypes): React.ReactNode => {
  if (mappingResults.loadingMapping) {
    return <Spin className={styles.filterLoader} spinning />;
  }

  switch (type) {
    case FilterTypes.Variant:
      return <VariantFilters mappingResults={mappingResults} />;
    case FilterTypes.Gene:
      return <GeneFilters mappingResults={mappingResults} />;
    case FilterTypes.Pathogenicity:
      return <PathogenicityFilters mappingResults={mappingResults} />;
    case FilterTypes.Frequency:
      return <FrequencyFilters mappingResults={mappingResults} />;
    case FilterTypes.Inheritance:
      return <InheritanceFilters mappingResults={mappingResults} />;
    case FilterTypes.Metric:
      return <MetricFilters mappingResults={mappingResults} />;
    default:
      return <div />;
  }
};

const PatientVariantScreen = () => {
  const variantMappingResults = useGetExtendedMappings(VARIANT_INDEX);

  const menuItems: ISidebarMenuItem[] = [
    {
      key: '1',
      title: intl.get('screen.patientvariant.category_variant'),
      icon: <LineStyleIcon />,
      panelContent: filtersContainer(variantMappingResults, FilterTypes.Variant),
    },
    {
      key: '2',
      title: intl.get('screen.patientvariant.category_genomic'),
      icon: <GeneIcon />,
      panelContent: filtersContainer(variantMappingResults, FilterTypes.Gene),
    },
    {
      key: '3',
      title: intl.get('screen.patientvariant.category_inheritance'),
      icon: <DiseaseIcon />,
      panelContent: filtersContainer(variantMappingResults, FilterTypes.Inheritance),
    },
    {
      key: '4',
      title: intl.get('screen.patientvariant.category_cohort'),
      icon: <FrequencyIcon />,
      panelContent: filtersContainer(variantMappingResults, FilterTypes.Frequency),
    },
    {
      key: '5',
      title: intl.get('screen.patientvariant.category_metric'),
      icon: <OccurenceIcon />,
      panelContent: filtersContainer(variantMappingResults, FilterTypes.Metric),
    },
    {
      key: '6',
      title: intl.get('screen.patientvariant.category_pathogenicity'),
      icon: <DiseaseIcon />,
      panelContent: filtersContainer(variantMappingResults, FilterTypes.Pathogenicity),
    },
  ];

  return (
    <div className={styles.patientVariantLayout}>
      <SidebarMenu className={styles.patientVariantSidebar} menuItems={menuItems} />
      <ScrollView className={styles.scrollContent}>
        <StackLayout vertical className={styles.pageContainer}>
          <VariantPageContainer mappingResults={variantMappingResults} />
        </StackLayout>
      </ScrollView>
    </div>
  );
};

export default PatientVariantScreen;
