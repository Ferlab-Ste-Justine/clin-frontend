import React, { useState } from 'react';
import QueryBuilder from '@ferlab/ui/core/components/QueryBuilder';
import { IDictionary } from '@ferlab/ui/core/components/QueryBuilder/types';
import { getQueryBuilderCache, useFilters } from '@ferlab/ui/core/data/filters/utils';
import { resolveSyntheticSqon } from '@ferlab/ui/core/data/sqon/utils';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';
import intl from 'react-intl-universal';
import { Tabs } from 'antd';

import { ExtendedMapping } from 'components/Utils/utils';
//import { HitsStudiesResults } from 'store/graphql/studies/actions';
import { dotToUnderscore } from '@ferlab/ui/core/data/arranger/formatting';
import { MappingResults, useGetPageData } from 'store/graphql/utils/actions';
import { VariantEntity } from 'store/graphql/variants/models';
import { VARIANT_QUERY } from 'store/graphql/variants/queries';
import styleThemeColors from 'style/themes/default/colors.module.scss';

//import { fieldMappings } from './filters/fieldsMappings';
//import GenericFilters from './filters/GenericFilters';
import { VARIANT_INDEX, VARIANT_REPO_CACHE_KEY } from './constants';
import VariantTableContainer from './VariantTableContainer';
import GeneTableContainer from './GeneTableContainer';
import { history } from 'configureStore';

import styles from './VariantPageContainer.module.scss';

export type VariantPageContainerData = {
  mappingResults: MappingResults;
};

export type VariantPageResults = {
  data: {
    Variants: {
      hits: {
        edges: [
          {
            node: VariantEntity;
          },
        ];
        total?: number;
      };
    };
  };
  loading: boolean;
};

const DEFAULT_PAGE_NUM = 1;
export const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_STUDIES_SIZE = 30000;

const VariantPageContainer = ({ mappingResults }: VariantPageContainerData) => {
  const [currentPageNum, setCurrentPageNum] = useState(DEFAULT_PAGE_NUM);
  const [currentPageSize, setcurrentPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { filters } = useFilters();
  const allSqons = getQueryBuilderCache(VARIANT_REPO_CACHE_KEY).state;
  const results = useGetPageData(
    {
      sqon: resolveSyntheticSqon(allSqons, filters),
      pageSize: currentPageSize,
      offset: currentPageSize * (currentPageNum - 1),
      sort: [
        //{ field: 'max_impact_score', order: 'desc' },
        { field: 'hgvsg', order: 'asc' },
      ],
      //studiesSize: DEFAULT_STUDIES_SIZE,
    },
    VARIANT_QUERY,
    VARIANT_INDEX,
  );
  //const [selectedFilterContent, setSelectedFilterContent] = useState<ReactElement | undefined>(
  //  undefined,
  //);

  const total = results.data?.Variants.hits.total || 0;

  const dictionary: IDictionary = {
    query: {
      combine: {
        and: intl.get('querybuilder.query.combine.and'),
        or: intl.get('querybuilder.query.combine.or'),
      },
      noQuery: intl.get('querybuilder.query.noQuery'),
      facet: (key) => {
        if (key == 'locus') return 'Variant';

        return (
          mappingResults?.extendedMapping?.find((mapping: ExtendedMapping) => key === mapping.field)
            ?.displayName || key
        );
      },
      //facetValueMapping: fieldMappings,
    },
    actions: {
      new: intl.get('querybuilder.actions.new'),
      addQuery: intl.get('querybuilder.actions.addQuery'),
      combine: intl.get('querybuilder.actions.combine'),
      labels: intl.get('querybuilder.actions.labels'),
      changeOperatorTo: intl.get('querybuilder.actions.changeOperatorTo'),
      delete: {
        title: intl.get('querybuilder.actions.delete.title'),
        cancel: intl.get('querybuilder.actions.delete.cancel'),
        confirm: intl.get('querybuilder.actions.delete.confirm'),
      },
      clear: {
        title: intl.get('querybuilder.actions.clear.title'),
        cancel: intl.get('querybuilder.actions.clear.cancel'),
        confirm: intl.get('querybuilder.actions.clear.confirm'),
        buttonTitle: intl.get('querybuilder.actions.clear.buttonTitle'),
        description: intl.get('querybuilder.actions.clear.description'),
      },
    },
  };

  return (
    <StackLayout vertical className={styles.variantPagecontainer}>
      <QueryBuilder
        className="patient-variant-repo__query-builder"
        headerConfig={{
          showHeader: true,
          showTools: false,
          defaultTitle: 'Variant Query',
        }}
        history={history}
        cacheKey={VARIANT_REPO_CACHE_KEY}
        enableCombine={false}
        currentQuery={filters?.content?.length ? filters : {}}
        loading={results.loading}
        total={total}
        dictionary={dictionary}
      />
      <Tabs type="card" className={styles.variantTabs}>
        <Tabs.TabPane tab={intl.get('screen.patientvariant.results.table.variants')} key="variants">
          <VariantTableContainer
            results={results}
            filters={filters}
            setCurrentPageCb={setCurrentPageNum}
            currentPageSize={currentPageSize}
            setcurrentPageSize={setcurrentPageSize}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.get('screen.patientvariant.results.table.genes')} key="genes">
          <GeneTableContainer
            results={results}
            filters={filters}
            setCurrentPageCb={setCurrentPageNum}
            currentPageSize={currentPageSize}
            setcurrentPageSize={setcurrentPageSize}
          />
        </Tabs.TabPane>
      </Tabs>
    </StackLayout>
  );
};
export default VariantPageContainer;
