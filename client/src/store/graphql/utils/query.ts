import {
  ApolloError,
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  TypedDocumentNode,
  useQuery,
} from '@apollo/client';

export enum Hits {
    COLLECTION = 'hits.edges',
    SINGLE_ITEM = 'hits.edges[0].node',
    ITEM = 'hits',
  }

export interface IBaseQueryResults<TData> {
    error: ApolloError | undefined;
    result: TData | undefined;
    loading: boolean;
  }

export const useLazyResultQuery = <TData = any, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>,
): IBaseQueryResults<TData> => {
  const {
    data, error, loading, previousData,
  } = useQuery<TData, TVariables>(query, options);

  const result = data ? data : previousData;
  return { error, loading, result };
};
