import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { PatientSearchHits } from '../fhir/types';

const MAX_SIZE = 96;

function validateData(patients: PatientSearchHits[]) {
  // TODO: This should validate the request selected, not the patient holding the request.
  return patients.length <= MAX_SIZE && patients.every((p) => p.requests.some((r) => r.status === 'active'));
}

export function generateExport(patients: PatientSearchHits[]) {
  if (!validateData(patients)) {
    throw new Error('invalid_data');
  }

  return {
    export_id: uuid(),
    version_id: '1.0',
    test_genomique: 'exome',
    LDM: 'CHU Sainte-Justine', // Hardcoded for now
    patients: patients.map((p) => ({
      type_echantillon: 'ADN',
      tissue_source: 'Sang',
      type_specimen: 'Normal',
      nom_patient: p.lastName,
      prenom_patient: p.firstName,
      patient_id: p.id,
      service_request_id: p.requests[0].request,
      dossier_medical: p.mrn,
      institution: p.organization.name || p.organization.id.split('/')[1],
      DDN: moment(p.birthDate).format('DD/MM/yyyy'),
      sexe: p.gender.toLowerCase(),
      famille_id: p.familyId,
      position: p.position,
    })),
  };
}
