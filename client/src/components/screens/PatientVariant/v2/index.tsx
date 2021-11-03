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
import { MappingResults, useGetExtendedMappings } from 'store/graphql/utils/actions';
import { VARIANT_INDEX } from 'components/screens/PatientVariant/v2/constants';
import FilterList from './filters/FilterList';

import styles from './PatientVariant.module.scss';
import { Spin } from 'antd';
import { FilterGroup } from './filters/types';

const DEFAULT_PAGE_NUM = 1;

enum FilterTypes {
  Variant,
  Gene,
  Pathogenicity,
  Frequency,
  Occurrence,
}

const filterGroups: { [type: string]: FilterGroup[] } = {
  [FilterTypes.Variant]: [
    {
      fields: [
        'variant_class',
        'consequences__consequences',
        'variant_external_reference',
        'chromosome',
        'start',
      ],
    },
  ],
  [FilterTypes.Gene]: [
    { fields: ['consequences__biotype', 'gene_external_reference'] },
    {
      title: 'screen.patientvariant.filter.grouptitle.genepanel',
      fields: [
        'genes__hpo__hpo_term_label',
        'genes__orphanet__panel',
        'genes__omim__name',
        'genes__ddd__disease_name',
        'genes__cosmic__tumour_types_germline',
      ],
    },
  ],
  [FilterTypes.Pathogenicity]: [
    {
      fields: ['clinvar__clin_sig', 'consequences__vep_impact'],
    },
    {
      title: 'screen.patientvariant.filter.grouptitle.predictions',
      fields: [
        'consequences__predictions__sift_pred',
        'consequences__predictions__polyphen2_hvar_pred',
        'consequences__predictions__fathmm_pred',
        'consequences__predictions__cadd_score',
        'consequences__predictions__dann_score',
        'consequences__predictions__lrt_pred',
        'consequences__predictions__revel_rankscore',
      ],
    },
  ],
  [FilterTypes.Frequency]: [
    {
      title: 'screen.patientvariant.filter.grouptitle.publiccohorts',
      fields: [
        //'participant_frequency',
        //'frequencies__gnomad_genomes_2_1__af',
        'frequencies__gnomad_genomes_3_0__af',
        'frequencies__gnomad_genomes_3_1_1__af',
        //'frequencies__gnomad_exomes_2_1__af',
        'frequencies__topmed_bravo__af',
        'frequencies__thousand_genomes__af',
      ],
    },
  ],
  [FilterTypes.Occurrence]: [
    {
      fields: ['donors__zygosity' /*'donors__transmission'*/],
    },
    {
      title: 'screen.patientvariant.category_metric',
      fields: [
        'donors__qd',
        'donors__ad_alt',
        'donors__ad_total',
        'donors__ad_ratio',
        'donors__gq',
      ],
    },
  ],
};

const filtersContainer = (mappingResults: MappingResults, type: FilterTypes): React.ReactNode => {
  if (mappingResults.loadingMapping) {
    return <Spin className={styles.filterLoader} spinning />;
  }

  return <FilterList mappingResults={mappingResults} filterGroups={filterGroups[type]} />;
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
      title: intl.get('screen.patientvariant.category_cohort'),
      icon: <FrequencyIcon />,
      panelContent: filtersContainer(variantMappingResults, FilterTypes.Frequency),
    },
    {
      key: '4',
      title: intl.get('screen.patientvariant.category_pathogenicity'),
      icon: <DiseaseIcon />,
      panelContent: filtersContainer(variantMappingResults, FilterTypes.Pathogenicity),
    },
    {
      key: '5',
      title: intl.get('screen.patientvariant.category_occurrence'),
      icon: <OccurenceIcon />,
      panelContent: filtersContainer(variantMappingResults, FilterTypes.Occurrence),
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
