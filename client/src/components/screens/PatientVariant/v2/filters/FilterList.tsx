import React, { useState } from 'react';
import { Button, Layout } from 'antd';
import { MappingResults } from 'store/graphql/utils/actions';
import CustomFilterContainer from './CustomFilterContainer';
import intl from 'react-intl-universal';
import { FilterGroup } from './types';

import styles from './Filters.module.scss';

type OwnProps = {
  mappingResults: MappingResults;
  filterGroups: FilterGroup[];
};

const FilterList = ({ mappingResults, filterGroups }: OwnProps) => {
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
        {filterGroups.map((group: FilterGroup) => (
          <>
            {group.title ? (
              <div className={styles.filterGroupTitle}>{intl.get(group.title)}</div>
            ) : null}
            {group.fields.map((field) => (
              <CustomFilterContainer
                key={field}
                classname={styles.variantFilterContainer}
                filterKey={field}
                mappingResults={mappingResults}
                filtersOpen={filtersOpen}
              />
            ))}
          </>
        ))}
      </Layout>
    </>
  );
};

export default FilterList;
