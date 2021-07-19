import { v4 as uuid } from 'uuid';
import { PatientNanuqInformation } from '../search/types';

const MAX_SIZE = 96;

function validateData(patients: PatientNanuqInformation[]) {
  // TODO: This should validate the request selected, not the patient holding the request.
  return patients.length <= MAX_SIZE && patients.every((p: PatientNanuqInformation) => p.isActive);
}

export function generateExport(patients: any[]) {
  if (!validateData(patients)) {
    throw new Error('invalid_data');
  }
  return {
    export_id: uuid(),
    version_id: '1.0',
    test_genomique: 'exome',
    LDM: 'CHU Sainte-Justine', // Hardcoded for now
    patients: patients.map((p: any) => ({
      type_echantillon: 'ADN',
      tissue_source: 'Sang',
      type_specimen: 'Normal',
      nom_patient: p.nom_patient,
      prenom_patient: p.prenom_patient,
      patient_id: p.patient_id,
      service_request_id: p.service_request_id,
      dossier_medical: p.dossier_medical ? p.dossier_medical : '--',
      institution: p.institution,
      DDN: p.DDN,
      sexe: p.sexe.toLowerCase(),
      family_id: p.family_id,
      position: p.position,
    })),
  };
}
