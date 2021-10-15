import { GqlData } from '.';

export type DataCategory = {
  data_category: string;
  count: number;
};

type HitsResultsDataCategory = {
  hits: {
    edges: [
      {
        node: DataCategory;
      },
    ];
  };
};
export interface PrescriptionsResult extends GqlData {
  cid: string;
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

export const fields = [
  'status',
  'test',
  'practitioner__lastNameFirstName',
];
