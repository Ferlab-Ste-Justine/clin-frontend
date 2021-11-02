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
  'variant_class',
  'consequences__consequences',
  'variant_external_reference',
  'chromosome',
  'start',
];
const SUGGESTION_TYPE = 'variants';
const PLACE_HOLDER_TEXT = 'chr2:g.28025382G>T';
const TITLE = 'Search by Variant';

const VariantFilter = ({ mappingResults }: OwnProps) => {
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

export default VariantFilter;
