import React, { useState } from 'react';
import { MappingResults } from 'store/graphql/utils/actions';
import { Button, Layout } from 'antd';
import intl from 'react-intl-universal';

import CustomFilterContainer from './CustomFilterContainer';

import styles from './Filters.module.scss';

type OwnProps = {
  mappingResults: MappingResults;
};

const INPUT_FILTER_LIST = [
  'consequences__biotype',
  'gene_external_reference',
  'genes__hpo__hpo_term_label',
  'genes__orphanet__panel',
  'genes__omim__name',
  'genes__ddd__disease_name',
  'genes__cosmic__tumour_types_germline',
];
const SUGGESTION_TYPE = 'genes';
const PLACE_HOLDER_TEXT = 'BRAF';
const TITLE = 'Search by Gene';

const GeneFilter = ({ mappingResults }: OwnProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <Layout>
      <div className={styles.expandButtonContainerVariant}>
        <Button onClick={() => setFiltersOpen(!filtersOpen)} type="link">
          {filtersOpen
            ? intl.get('screen.patientvariant.filter.collapse.all')
            : intl.get('screen.patientvariant.filter.expand.all')}
        </Button>
      </div>
      <Layout className={styles.variantFilterWrapper}>
        {INPUT_FILTER_LIST.map((inputFilter) => (
          <CustomFilterContainer
            key={inputFilter}
            classname={styles.variantFilterContainer}
            filterKey={inputFilter}
            mappingResults={mappingResults}
            filtersOpen={filtersOpen}
          />
        ))}
      </Layout>
    </Layout>
  );
};

export default GeneFilter;
