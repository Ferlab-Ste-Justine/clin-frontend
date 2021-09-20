import { PatientNanuqInformation } from '../helpers/search/types';

import { NANUQ_EXPORT_REQUESTED } from './type';

export const generateNanuqReport = (selectedPatientIds: PatientNanuqInformation[]) => ({
  payload: selectedPatientIds,
  type: NANUQ_EXPORT_REQUESTED,
});
