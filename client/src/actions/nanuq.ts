import { NANUQ_EXPORT_REQUESTED } from './type';

export const generateNanuqReport = (selectedPatientIds: string[]) => ({
  type: NANUQ_EXPORT_REQUESTED,
  payload: selectedPatientIds,
});
