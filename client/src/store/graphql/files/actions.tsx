import { useLazyResultQuery } from 'store/graphql/utils/query';

import { FILES_QUERY } from './queries';

export type QueryVariable = {
  patientId: string;
};

export const getFilesData = (variables: QueryVariable) => () => {
  const {  loading, result, } = useLazyResultQuery<any>(FILES_QUERY(variables.patientId), {
    variables,
  });

  return {
    loading,
    results: result?.Patient,
  };
};
