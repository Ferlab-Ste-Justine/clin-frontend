import { PatientResponse } from 'components/screens/Patient/components/FilesTab';
import { useLazyResultQuery } from 'store/graphql/utils/query';

import { FILES_QUERY } from './queries';

export type QueryVariable = {
  patientId: string;
};

export type UseFilesResponse = {
  loading:boolean
  results: ResultsFilesResponse
}

export type ResultsFilesResponse = {
  docs:PatientResponse [];
  id:string;
}

export const useFilesData = (variables: QueryVariable): UseFilesResponse => {
  const {  loading, result, } = useLazyResultQuery<any>(FILES_QUERY(variables.patientId), {
    variables,
  });

  return {
    loading,
    results: result?.Patient || [],
  };
};
