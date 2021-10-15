import { PrescriptionsResult } from 'store/graphql/prescriptions/models/Prescription';
import { ExtendedMapping } from 'store/graphql/utils/Filters';
import { useLazyResultQuery } from 'store/graphql/utils/query';

import { AggregationBuckets, GqlResults } from './models';
import { INDEX_EXTENDED_MAPPING, PRESCRIPTIONS_QUERY } from './queries';


type ArrangerHits = {
  node: PrescriptionsResult;
};

export type QueryVariable = {
  sqon: any;
  first: number; // number of element to fetch
  offset: number; // start from offset number of elements
};

type AggregationResults = {
  domain: AggregationBuckets;
  experimental_strategy: AggregationBuckets;
  family_data: AggregationBuckets;
  program: AggregationBuckets;
};

export interface PrescriptionsResults extends GqlResults {
  data: PrescriptionsResult[];
  aggregations: AggregationResults;
  loading: boolean;
  total: number;
};

const hydratePrescriptions = (results: ArrangerHits[]): PrescriptionsResult[] =>
  results.map((edge: any) => ({
      ...edge.node,
      key: edge.node.cid
    }));

export const usePrescription = (variables: QueryVariable): PrescriptionsResults => {
  const { loading, result } = useLazyResultQuery<any>(PRESCRIPTIONS_QUERY, {
    variables: variables,
  });
  return {
    aggregations: result?.Prescriptions.aggregations,
    data: hydratePrescriptions(result?.Prescriptions.hits.edges || []),
    loading,
    total: result?.Prescriptions.hits.total
  };
};

export type ExtendedMappingResults = {
  loading: boolean;
  data: ExtendedMapping[];
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

