import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { PrescriptionData } from '../search/types';

const MAX_SIZE = 96;

function validateData(patients:PrescriptionData[]) {
  // TODO: This should validate the request selected, not the patient holding the request.
  return patients.length <= MAX_SIZE && patients.every((p:PrescriptionData) => p.status === 'active');
}

export function generateExport(patients:PrescriptionData[]) {
  if (!validateData(patients)) {
    throw new Error('invalid_data');
  }

  return {
    export_id: uuid(),
    version_id: '1.0',
    test_genomique: 'exome',
    LDM: 'CHU Sainte-Justine', // Hardcoded for now
    patients: patients.map((p:PrescriptionData) => ({
      type_echantillon: 'ADN',
      tissue_source: 'Sang',
      type_specimen: 'Normal',
      nom_patient: p.patientInfo.lastName,
      prenom_patient: p.patientInfo.firstName,
      patient_id: p.patientInfo.id,
      service_request_id: p.id,
      dossier_medical: 'MRN0001', // Hardcoded for now
      institution: p.patientInfo.organization.name || p.patientInfo.organization.id.split('/')[1],
      DDN: moment(p.patientInfo.birthDate).format('DD/MM/yyyy'),
      sexe: p.patientInfo.gender.toLowerCase(),
      famille_id: p.familyInfo.id,
      position: p.patientInfo.position,
    })),
  };
}
