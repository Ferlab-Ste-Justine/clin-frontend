/* eslint-disable no-unused-vars */
import moment from 'moment';
import { curry } from 'lodash';

import uuidv1 from 'uuid/v1';
import intl from 'react-intl-universal';


export const createBundle = () => ({
  resourceType: 'Bundle',
  type: 'transaction',
  entry: [],
});

const RESOURCE_TYPE_CLINICAL_IMPRESSION = 'ClinicalImpression';


export const createRequest = (resource) => {
  const {
    resourceType,
    id,
  } = resource;
  return {
    method: id ? 'PUT' : 'POST',
    url: id ? `${resourceType}/${id}` : resourceType,
  };
};

const createFullUrl = resource => (resource.id ? `${resource.resourceType}/${resource.id}` : `urn:uuid:${uuidv1()}`);
const createEntry = (resource) => {
  console.log();

  return {
    fullUrl: createFullUrl(resource),
    resource,
    request: createRequest(resource),
  };
};

const createPatientResource = patient => (
  {
    resourceType: 'Patient',
    name: patient.name,
    gender: patient.gender,
    birthDate: patient.birthDate,
    id: patient.id ? patient.id : null,
    // TODO
    // identifier: ...,
    // ramq: ...,
    // mrn: ...,
    // managingOrganization: ...,
    // ethnicity: ...,
    // cosanguinity: ...,
  }
);

const createServiceRequestResource = (patientUrl, serviceRequest) => {
  console.log();

  return {
    resourceType: 'ServiceRequest',
    id: serviceRequest ? serviceRequest.id : null,
    status: serviceRequest ? serviceRequest.status : 'draft',
    subject: {
      reference: patientUrl,
    },
  };
};

export const createPatientBundle = (patient, serviceRequest) => {
  const patientResource = createPatientResource(patient);
  const patientRequest = createRequest(patientResource);
  const patientEntry = createEntry(patientResource);
  const patientUrl = patientEntry.fullUrl;

  const bundle = createBundle();
  bundle.entry.push(patientEntry);

  const serviceRequestResource = createServiceRequestResource(patientUrl, serviceRequest);
  const servicerequestEntry = createEntry(serviceRequestResource);

  bundle.entry.push(servicerequestEntry);

  return bundle;
};

export const createCGHResource = ({
  patientUrl, code, categoryCode, categoryCodeDisplay, categoryText, ext, note,
}) => {
  const newObs = {
    resourceType: 'Observation',
    id: 'cgh-001',
    meta: {
      profile: [
        'http://hl7.org/fhir/StructureDefinition/Observation',
      ],
    },

    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: categoryCode,
            display: categoryCodeDisplay,
          },
        ],
        text: categoryText,
      },
    ],
    code: { text: code },
    subject: { reference: patientUrl },
    valueBoolean: true,
    note: [{ text: note }],
  };

  return newObs;
};

const createHPOResource = () => {
  console.log();

  return {
    resourceType: 'Observation',
    id: 'ph-001',
    meta: {
      profile: [
        'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset',
      ],
    },

    extension: [
      {
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset',
        valueCoding: {
          code: 'HP:0003577',
          display: "d'apparition congénitale",
        },
      },
    ],

    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'exam',
            display: 'Exam',
          },
        ],
        text: 'Signes cliniques relevés par le praticien lors de la consultation',
      },
    ],

    code: { text: 'phenotype-observation' },
    subject: { reference: 'Patient/pt-001' },

    valueCodeableConcept: {
      coding: [
        {
          system: 'http://purl.obolibrary.org/obo/hp.owl',
          code: 'HP:0001252',
          display: 'Abnormal anatomic location of the heart',
        },
      ],
    },
    note: [{ text: "une note en texte libre sur l'observation" }],
    interpretation: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: 'POS',
            display: 'Positive',
          },
        ],
        text: 'Observé',
      },
    ],
  };
};

const createInvestigationSummaryResource = () => {
  console.group();

  return {
    resourceType: 'Observation',
    id: 'inv-001',
    meta: {
      profile: [
        'http://hl7.org/fhir/StructureDefinition/Observation',
      ],
    },

    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'exam',
            display: 'Exam',
          },
        ],
        text: 'Indications - hypothèse(s) de diagnostique',
      },
    ],
    code: { text: 'investigations' },
    subject: { reference: 'Patient/pt-001' },
    note: [{ text: "Resume de l'investigation clinique et paraclinique realisees" }],
  };
};

const createIndicationResource = () => {
  console.log();
  return {
    resourceType: 'Observation',
    id: 'ind-001',
    meta: {
      profile: [
        'http://hl7.org/fhir/StructureDefinition/Observation',
      ],
    },

    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'exam',
            display: 'Exam',
          },
        ],
        text: 'Indications - hypothèse(s) de diagnostique',
      },
    ],
    code: { text: 'indications' },
    subject: { reference: 'Patient/pt-001' },
    note: [{ text: 'Syndrome de microdélétion' }],
  };
};

// 1. Create clinicalImpression resource
// 2. Add clinical impression entry to bundle ({resource:---, request: ---})
// 3. Create observation resource
// 4. Add observation entry to bundle (will have to look for clinical impression resource to add reference to observation. Observation resource needs a fullUrl field to serve as reference target)

const addObservationEntry = curry((bundle, resource) => {
  const url = createFullUrl(resource);
  const clinicalImpression = bundle.entry.find(e => e.resource.resourceType === 'ClinicalImpression');

  if (clinicalImpression) {
    clinicalImpression.investigation.item.push({
      reference: url,
    });

    bundle.entry.add({
      resource,
      request: createRequest(resource),
    });
  }
});

export const STATE_CLINICAL_IMPRESSION = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ENTERED_IN_ERROR: 'entered-in-error',
};

const createClinicalImpressionResource = ({
  id, status, age, subject, date, assessor,
}) => {
  console.log();

  const resource = {
    resourceType: RESOURCE_TYPE_CLINICAL_IMPRESSION,
    id,
    meta: {
      profile: [
        'http://fhir.cqdg.ferlab.bio/StructureDefinition/cqdg-clinical-impression',
      ],
    },

    extension: [
      {
        url: 'http://fhir.cqdg.ferlab.bio/StructureDefinition/age-at-event',
        valueAge: {
          value: age,
          unit: 'days',
          system: 'http://unitsofmeasure.org',
          code: 'd',
        },
      },
    ],

    status,
    description: 'This source refers to the consultation with the doctor',
    subject: { reference: subject },
    date,
    assessor: { reference: assessor },
    investigation: [
      {
        code: {
          text: 'initial-examination',
        },
        item: [],
      },
    ],
  };
};

const createClinicalImpressionBundle = ({ clinicalImpression, cgh, hpo }) => {
  const bundle = createBundle();
  const resource = createClinicalImpressionResource(clinicalImpression);

  bundle.entry.push({
    resource,
    request: createRequest(resource),
  });

  const cghResources = createCGHResource(cgh);
  cghResources.forEach(addObservationEntry(bundle));

  // TODO
  // const hpoResources = createHPOResource(hpo);
  // cghResources.forEach(addObservationEntry(bundle));

  return bundle;
};


// const addObservationReference = curry((clinicalImpressionResource, observationResource) => {
//   const ref =
// });
