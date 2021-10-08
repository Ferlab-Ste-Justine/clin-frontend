
export type Results = {
  data: GQLData | null;
  loading: boolean;
};

export interface GQLData {
  hits: any; //TODO refine type?
  aggregations: any; //TODO refine type?
}
