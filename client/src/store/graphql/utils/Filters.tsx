import React from 'react';
import intl from 'react-intl-universal';
import FilterContainer from '@ferlab/ui/core/components/filters/FilterContainer';
import FilterSelector from '@ferlab/ui/core/components/filters/FilterSelector';
import { IFilter, IFilterGroup } from '@ferlab/ui/core/components/filters/types';
import { keyEnhance, keyEnhanceBooleanOnly, underscoreToDot } from '@ferlab/ui/core/data/arranger/formatting';
import {
  getFilterType,
  getSelectedFilters,
  updateFilters,
} from '@ferlab/ui/core/data/filters/utils';
import * as H from 'history';

import { Aggregations } from 'store/graphql/models';
import { ExtendedMapping, ExtendedMappingResults } from 'store/graphql/models';
export interface RangeAggs {
  stats: {
    max: number;
    min: number;
  };
}

export interface TermAggs {
  buckets: TermAgg[];
}

export interface TermAgg {
  doc_count: number;
  key: string;
}

export type Aggs = TermAggs | RangeAggs;

const isTermAgg = (obj: TermAggs) => !!obj.buckets;
const isRangeAgg = (obj: RangeAggs) => !!obj.stats;

export const generateFilters = (
  history:  H.History<any>,
  aggregations: Aggregations,
  extendedMapping: ExtendedMappingResults,
  className = '',
  showSearchInput = false,
  useFilterSelector = false,
): React.ReactElement[] =>
  Object.keys(aggregations || []).map((key) => {
    const found = (extendedMapping?.data || []).find(
      (f: any) => f.field === underscoreToDot(key),
    );

    const filterGroup = getFilterGroup(found, aggregations[key], []);
    const filters = getFilters(aggregations, key);
    const selectedFilters = getSelectedFilters(filters, filterGroup);
    const FilterComponent = useFilterSelector ? FilterSelector : FilterContainer;

    return (
      <div className={className} key={key}>
        <FilterComponent
          filterGroup={filterGroup}
          filters={filters}
          maxShowing={5}
          onChange={(fg, f) => {
            updateFilters(history, fg, f);
          }}
          searchInputVisible={showSearchInput}
          selectedFilters={selectedFilters}
        />
      </div>
    );
  });

const getFilters = (aggregations: Aggregations | null, key: string): IFilter[] => {
  if (!aggregations || !key) return [];
  if (isTermAgg(aggregations[key])) {
    return  aggregations[key!].buckets.map((f: any) => {
      const translatedKey = intl.get(`filters.${keyEnhance(f.key)}`);
      const name = translatedKey ? translatedKey : f.key;
      return {
        data: {
          count: f.doc_count,
          key: keyEnhanceBooleanOnly(f.key),
        },
        id: f.key,
        name: name
      };
    });
  } else if (aggregations[key]?.stats) {
    return [
      {
        data: { max: 1, min: 0 },
        id: key,
        name: intl.get(`filters.${keyEnhance(key)}`),
      },
    ];
  }
  return [];
};

const getFilterGroup = (
  filter: ExtendedMapping | undefined,
  aggregation: any,
  rangeTypes: string[],
): IFilterGroup => {
  if (isRangeAgg(aggregation)) {
    return {
      config: {
        max: aggregation.stats.max,
        min: aggregation.stats.min,
        rangeTypes: rangeTypes.map((r) => ({
          key: r,
          name: r,
        })),
        step: filter?.rangeStep || 1,
      },
      field: filter?.field || '',
      title: filter?.displayName || '',
      type: getFilterType(filter?.type || ''),
    };
  }

  return {
    field: filter?.field || '',
    title: intl.get(`filters.header.${filter?.field}`) || '',
    type: getFilterType(filter?.type || ''),
  };
};