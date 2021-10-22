export interface GqlData {
  cid: string;
  code: string;
  name: string;
  status: string;
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

export type Aggregations = Record<string, AggregationBuckets>
export interface GqlResults {
  data: GqlData[];
  aggregations: Aggregations;
  loading: boolean;
  total: number;
}