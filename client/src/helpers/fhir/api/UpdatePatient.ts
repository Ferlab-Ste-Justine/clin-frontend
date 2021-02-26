import httpClient from '../../http-client';
import {
  ClinicalImpression, Patient, Reference, ServiceRequest,
} from '../types';

const shouldAddAsGeneralPractitioner = (patient: Patient, reference?: Reference) => {
  if (reference == null) {
    return false;
  }
  return patient.generalPractitioner.find((pract) => pract.reference === reference.reference) == null;
};

const getReferenceId = (reference?: Reference) : string => reference!.reference.split('/')[1];

const getPractitionerRoleReference = (id: string): Reference => ({
  reference: `PractitionerRole/${id}`,
});

export const updatePatientPractitioners = async (
  patient: Patient,
  serviceRequest: ServiceRequest, clinicalImpression: ClinicalImpression,
) => {
  if (patient.id == null) {
    throw new Error('Invalid patient id');
  }
  const updatedPatient = JSON.parse(JSON.stringify(patient));

  let updated = false;

  if (shouldAddAsGeneralPractitioner(updatedPatient, serviceRequest.requester)) {
    const response = await httpClient.secureClinAxios.get(
      `${window.CLIN.fhirBaseUrl}/PractitionerRole?practitioner=${getReferenceId(serviceRequest.requester)}`,
    );

    updatedPatient.generalPractitioner = [
      ...updatedPatient.generalPractitioner,
      getPractitionerRoleReference(response.data.entry[0].resource.id),
    ];
    updated = true;
  }

  if (shouldAddAsGeneralPractitioner(updatedPatient, clinicalImpression.assessor)) {
    updatedPatient.generalPractitioner = [
      ...updatedPatient.generalPractitioner,
      getPractitionerRoleReference(getReferenceId(clinicalImpression.assessor)),
    ];
    updated = true;
  }

  if (updated) {
    await httpClient.secureClinAxios.put(`${window.CLIN.fhirBaseUrl}/Patient/${patient.id}`, updatedPatient);
  }

  return updatedPatient;
};

export const addPatientMrn = async (patient: Patient, mrn: string, organization: string) => {
  if (mrn == null || organization == null) {
    throw new Error('Invalid mrn number or organization');
  }
  if (patient.identifier.find((id) => id.value === mrn) != null) {
    throw new Error(`MRN [${mrn}] already exists in patient resource`);
  }

  const updatedPatient = JSON.parse(JSON.stringify(patient));

  updatedPatient.identifier = [
    ...patient.identifier,
    {
      type: {
        coding: [
          {
            code: 'MR',
            display: 'Medical record number',
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
          },
        ],
        text: 'Numéro du dossier médical',
      },
      value: mrn,
      assigner: {
        reference: `Organization/${organization}`,
      },
    },
  ];

  await httpClient.secureClinAxios.put(`${window.CLIN.fhirBaseUrl}/Patient/${updatedPatient.id}`, updatedPatient);

  return updatedPatient;
};
