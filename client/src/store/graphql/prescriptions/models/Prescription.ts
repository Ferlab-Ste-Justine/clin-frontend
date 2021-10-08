import { HitsResultsDataCategory } from '../actions';

import { Results } from '.';

export type PrescriptionsResult = {
  kf_id: string;
  name: string;
  domain: string[];
  score: string;
  code: string;
  family_count: string;
  file_count: string;
  data_category_count?: HitsResultsDataCategory;
  data_access_authority: string;
  external_id: string;
};

export type DataCategory = {
  data_category: string;
  count: number;
};

export const hydratePrescriptions = (results: Results): PrescriptionsResult[] =>
  results.data?.hits.edges.map((edge: any) => ({
      ...edge.node,
      key: edge.node.cid
    }));

export const fields = [
  'status',
  'test',
  'practitioner__lastNameFirstName',
];
