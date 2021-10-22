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
  'clinvar__clin_sig',
  'consequences__vep_impact', //<--- not in index
  'consequences__predictions__sift_pred', //<--- not in index
  'consequences__predictions__polyphen2_hvar_pred', //<--- not in index
  'consequences__predictions__fathmm_pred', //<--- not in index
  'consequences__predictions__cadd_rankscore', //<--- not in index
  'consequences__predictions__dann_rankscore', //<--- not in index
  'consequences__predictions__lrt_pred', //<--- not in index
  'consequences__predictions__revel_rankscore', //<--- not in index
];

const PathogenicityFilters = ({ mappingResults }: OwnProps) => {
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

export default PathogenicityFilters;
