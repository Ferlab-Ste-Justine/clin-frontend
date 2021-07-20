import { NANUQ_EXPORT_REQUESTED } from './type';
import { PatientNanuqInformation } from '../helpers/search/types';

export const generateNanuqReport = (selectedPatientIds: PatientNanuqInformation[]) => ({
  type: NANUQ_EXPORT_REQUESTED,
  payload: selectedPatientIds,
});
