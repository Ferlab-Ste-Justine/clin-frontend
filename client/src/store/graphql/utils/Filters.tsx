import React from 'react';
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

import { ExtendedMappingResults } from 'store/graphql/prescriptions/actions';

import { GQLData, Results } from '../prescriptions/models';

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

const isTermAgg = (obj: any): obj is TermAggs => obj.buckets !== undefined;
const isRangeAgg = (obj: any): obj is RangeAggs => obj.stats !== undefined;

export type ExtendedMapping = {
  displayName: string;
  field: string;
  isArray: boolean;
  type: string;
  rangeStep?: number;
};

//TODO investigate: should only be called once per tab.
export const generateFilters = (
  history:  H.History<any>,
  results: Results,
  extendedMapping: ExtendedMappingResults,
  className = '',
  showSearchInput = false,
  useFilterSelector = false,
): React.ReactElement[] =>
  Object.keys(results.data?.aggregations || []).map((key) => {
    const found = (extendedMapping?.data || []).find(
      (f: any) => f.field === underscoreToDot(key),
    );

    const filterGroup = getFilterGroup(found, results.data?.aggregations[key], []);
    const filters = getFilters(results.data, key);
    const selectedFilters = getSelectedFilters(filters, filterGroup);
    const FilterComponent = useFilterSelector ? FilterSelector : FilterContainer;

    // TODO: move to ferlab component
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

const getFilters = (data: GQLData | null, key: string): IFilter[] => {
  if (!data || !key) return [];

  if (isTermAgg(data.aggregations[key])) {
    return data.aggregations[key!].buckets.map((f: any) => ({
      data: {
        count: f.doc_count,
        key: keyEnhanceBooleanOnly(f.key),
      },
      id: f.key,
      name: keyEnhance(f.key),
    }));
  } else if (data.aggregations[key]?.stats) {
    return [
      {
        data: { max: 1, min: 0 },
        id: key,
        name: keyEnhance(key),
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
    title: filter?.displayName || '',
    type: getFilterType(filter?.type || ''),
  };
};