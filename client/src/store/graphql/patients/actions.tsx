import {GqlResults, hydrateResults} from 'store/graphql/models';
import { ExtendedMapping } from 'store/graphql/models';
import { PatientResult } from 'store/graphql/patients/models/Patient';
import { QueryVariable } from 'store/graphql/queries';
import { INDEX_EXTENDED_MAPPING } from 'store/graphql/queries';
import { useLazyResultQuery } from 'store/graphql/utils/query';

import { PATIENTS_QUERY } from './queries';

export const usePatients = (variables: QueryVariable): GqlResults<PatientResult> => {
  const { loading, result } = useLazyResultQuery<any>(PATIENTS_QUERY, {
    variables: variables,
  });
  const patients = result?.Patients;

  return {
    aggregations: patients?.aggregations,
    data: hydrateResults(patients?.hits?.edges || []),
    loading,
    total: patients?.hits.total
  };
};

export type ExtendedMappingResults = {
  loading: boolean;
  data: ExtendedMapping[];
};

export const usePatientsMapping = (): ExtendedMappingResults => {
  const { loading, result } = useLazyResultQuery<any>(INDEX_EXTENDED_MAPPING('Patients'), {
    variables: [],
  });

  return {
    data: result?.Patients.extended,
    loading: loading,
  };
};

