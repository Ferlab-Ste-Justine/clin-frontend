
const createSavePatientBundleRequestField = () => (
  {
    method: 'POST',
    url: 'Patient',
  }
);

const createUpdatePatientBundleRequestField = id => (
  {
    method: 'PUT',
    url: `Patient/${id}`,
  }
);

const createPatientResource = patient => (
  {
    resourceType: 'Patient',
    name: patient.name,
    gender: patient.gender,
    birthDate: patient.birthDate,
    // TODO
    // identifier: ...,
    // ramq: ...,
    // mrn: ...,
    // managingOrganization: ...,
    // ethnicity: ...,
    // cosanguinity: ...,
  }
);

export const createSavePatientBundle = patient => (
  {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {
        fullUrl: 'urn:uuid:pt-1',
        resource: createPatientResource(patient),
        request: createSavePatientBundleRequestField(),
      },
      {
        resource: {
          resourceType: 'ServiceRequest',
          status: 'draft',
          subject: {
            reference: 'urn:uuid:pt-1',
          },
        },
        request: {
          method: 'POST',
          url: 'ServiceRequest',
        },
      },
    ],
  }
);

export const createUpdatePatientBundle = (patient, serviceRequest) => (
  {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {
        fullUrl: 'urn:uuid:pt-1',
        resource: createPatientResource(patient),
        request: createUpdatePatientBundleRequestField(patient.id),
      },
      {
        resource: {
          resourceType: 'ServiceRequest',
          status: serviceRequest ? serviceRequest.status : 'draft',
          subject: {
            reference: `Patient/${patient.id}`,
          },
        },
        request: {
          method: 'POST',
          url: serviceRequest ? `ServiceRequest/${serviceRequest.id}` : '',
        },
      },
    ],
  }
);
