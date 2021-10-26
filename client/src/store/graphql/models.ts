export interface ArrangerNodeData {
  cid: string;
  key?: string;
}

export type AggregationBuckets = {
  buckets: [
    {
      key: string;
      doc_count: number;
    },
  ];
  stats: string;
};

export type Aggregations = Record<string, AggregationBuckets>;

export interface GqlResults<DataT> {
  data: DataT[];
  aggregations: Aggregations;
  loading: boolean;
  total: number;
}

// Recursive type that can represent nested query
export interface ArrangerResultsTree<T extends ArrangerNodeData> {
  hits: ArrangerHits<T>
}

export interface ArrangerHits<T extends ArrangerNodeData> {
  edges: ArrangerEdge<T>[];
};

export type ArrangerEdge<T extends ArrangerNodeData> = {
  node: T;
};

export type ExtendedMapping = {
  displayName: string;
  field: string;
  isArray: boolean;
  type: string;
  rangeStep?: number;
};

export type ExtendedMappingResults = {
  loading: boolean;
  data: ExtendedMapping[];
};

export const hydrateResults = <resultType extends ArrangerNodeData>
(results: ArrangerEdge<resultType>[]): resultType[] => results.map((edge: ArrangerEdge<resultType>): resultType => ({
    ...edge.node,
    key: edge.node.cid,
  }))

