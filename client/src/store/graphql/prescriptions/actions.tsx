import { DataCategory, PrescriptionsResult } from 'store/graphql/prescriptions/models/Prescription';
import { ExtendedMapping } from 'store/graphql/utils/Filters';
import { useLazyResultQuery } from 'store/graphql/utils/query';

import { INDEX_EXTENDED_MAPPING, PRESCRIPTIONS_QUERY, PRESCRIPTIONS_SEARCH_QUERY } from './queries';

type AggregationBuckets = {
  buckets: [
    {
      key: string;
      doc_count: number;
    },
  ];
};

type AggregationResults = {
  domain: AggregationBuckets;
  experimental_strategy: AggregationBuckets;
  family_data: AggregationBuckets;
  program: AggregationBuckets;
};

type HitsResults = {
  edges: [
    {
      node: PrescriptionsResult;
    },
  ];
  total: number;
};

export type HitsResultsDataCategory = {
  hits: {
    edges: [
      {
        node: DataCategory;
      },
    ];
  };
};

type PrescriptionsPageData = {
  aggregations: AggregationResults;
  hits: HitsResults;
};

export type ExtendedMappingResults = {
  loading: boolean;
  data: ExtendedMapping[];
};

export type PrescriptionsResults = {
  data: PrescriptionsPageData | null;
  loading: boolean;
};


export type QueryVariable = {
  sqon: any;
  first: number; // number of element to fetch
  offset: number; // start from offset number of elements
};

export const usePrescription = (variables: QueryVariable): PrescriptionsResults => {
  const { loading, result } = useLazyResultQuery<any>(PRESCRIPTIONS_QUERY, {
    variables: variables,
  });

  return {
    data: result?.Prescriptions || null,
    loading,
  };
};

export const usePrescriptionSearch = (variables: QueryVariable): PrescriptionsResults => {
  const { loading, result } = useLazyResultQuery<any>(PRESCRIPTIONS_SEARCH_QUERY, {
    variables: variables,
  });

  return {
    data: result?.Prescriptions || null,
    loading,
  };
};

export const usePrescriptionMapping = (): ExtendedMappingResults => {
  const { loading, result } = useLazyResultQuery<any>(INDEX_EXTENDED_MAPPING('Prescriptions'), {
    variables: [],
  });

  return {
    data: result?.Prescriptions.extended,
    loading: loading,
  };
};

