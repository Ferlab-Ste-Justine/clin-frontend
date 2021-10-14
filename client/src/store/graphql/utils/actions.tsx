import { DocumentNode, TypedDocumentNode } from '@apollo/client';

import { ExtendedMapping } from 'components/Utils/utils';
import { INDEX_EXTENDED_MAPPING, useLazyResultQuery } from './query';

export type MappingResults = {
  loadingMapping: boolean;
  extendedMapping: ExtendedMapping[];
};

type Sort = {
  field: string;
  order: string;
};

export type QueryVariable = {
  sqon: any;
  pageSize?: number; // number of element to fetch
  first?: number;
  studiesSize?: number;
  offset?: number; // start from offset number of elements
  sort?: Sort[];
};

export const useGetExtendedMappings = (index: string): MappingResults => {
  const { loading, result } = useLazyResultQuery<any>(INDEX_EXTENDED_MAPPING(index), {
    variables: [],
  });

  return {
    loadingMapping: loading,
    extendedMapping: (result && result[index]?.extended) || null,
  };
};

export const useGetPageData = (
  variables: QueryVariable,
  query: DocumentNode | TypedDocumentNode,
  index: string,
) => {
  const { loading, result } = useLazyResultQuery<any>(query, {
    variables: variables,
  });

  return {
    loading,
    data:
      result && result[index]
        ? {
            ...result,
          }
        : null,
  };
};

export const useGetFilterBuckets = (
  variables: QueryVariable,
  query: DocumentNode | TypedDocumentNode,
  index: string,
) => {
  const { loading, result } = useLazyResultQuery<any>(query, {
    variables: variables,
  });

  return {
    loading,
    data: (result && result[index]) || null,
  };
};
