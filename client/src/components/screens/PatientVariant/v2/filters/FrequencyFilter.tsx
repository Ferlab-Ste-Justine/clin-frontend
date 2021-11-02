import React, { useState } from 'react';
import { Button, Layout } from 'antd';
import { MappingResults } from 'store/graphql/utils/actions';

import CustomFilterContainer from './CustomFilterContainer';
import intl from 'react-intl-universal';

import styles from './Filters.module.scss';

type OwnProps = {
  mappingResults: MappingResults;
};

const INPUT_FILTER_LIST = [
  //'participant_frequency', //<--- not in index
  //'frequencies__gnomad_genomes_2_1__af',
  'frequencies__gnomad_genomes_3_0__af',
  'frequencies__gnomad_genomes_3_1_1__af',
  //'frequencies__gnomad_exomes_2_1__af',
  'frequencies__topmed_bravo__af',
  'frequencies__thousand_genomes__af',
];

const FrequencyFilter = ({ mappingResults }: OwnProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
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
    </>
  );
};

export default FrequencyFilter;
