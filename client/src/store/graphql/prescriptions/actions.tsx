import {ExtendedMappingResults, GqlResults, hydrateResults} from 'store/graphql/models';
import { PrescriptionResult } from 'store/graphql/prescriptions/models/Prescription';
import { INDEX_EXTENDED_MAPPING, QueryVariable } from 'store/graphql/queries';
import {useLazyResultQuery} from "store/graphql/utils/query";

import {PRESCRIPTIONS_QUERY} from './queries';

export const usePrescription = (variables: QueryVariable): GqlResults<PrescriptionResult> => {
  const {loading, result} = useLazyResultQuery<any>(PRESCRIPTIONS_QUERY, {
    variables: variables,
  });
  const prescriptions = result?.Prescriptions;
  return {
    aggregations: prescriptions?.aggregations || {},
    data: hydrateResults(prescriptions?.hits?.edges || []),
    loading,
    total: prescriptions?.hits.total
  };
};

export const usePrescriptionMapping = (): ExtendedMappingResults => {
  const { loading, result } = useLazyResultQuery<any>(INDEX_EXTENDED_MAPPING('Prescriptions'), {
    variables: [],
  });

  return {
    data: result?.Prescriptions.extended,
    loading: loading,
  };
};

