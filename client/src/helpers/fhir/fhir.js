/* eslint-disable no-unused-vars */
import moment from 'moment';
import { curry } from 'lodash';

import uuidv1 from 'uuid/v1';
import intl from 'react-intl-universal';

const CGH_CODE = 'cgh';

const isCGH = o => o.code.text === CGH_CODE;

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

const getReference = entry => ({ reference: entry.fullUrl });

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

const createServiceRequestResource = (serviceRequest) => {
  console.log();

  return {
    resourceType: 'ServiceRequest',
    id: serviceRequest ? serviceRequest.id : null,
    status: serviceRequest ? serviceRequest.status : 'draft',
  };
};

export const createClinicalImpressionResource = ({
  id, status, age, date, assessor,
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

  return resource;
};

export const createCGHResource = ({
  id, value, categoryText, note,
}) => {
  const newObs = {
    resourceType: 'Observation',
    id,
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
            code: 'laboratory',
            display: 'Laboratory',
          },
        ],
        text: categoryText,
      },
    ],
    code: { text: 'cgh' },
    valueBoolean: value,
    note: [{ text: note }],
  };

  return newObs;
};

export const createPatientSubmissionBundle = ({ patient, serviceRequest, clinicalImpression }) => {
  const patientResource = createPatientResource(patient);
  const patientEntry = createEntry(patientResource);
  const patientReference = getReference(patientEntry);

  const bundle = createBundle();
  bundle.entry.push(patientEntry);

  const serviceRequestResource = createServiceRequestResource(serviceRequest);
  serviceRequestResource.subject = patientReference;
  const servicerequestEntry = createEntry(serviceRequestResource);

  bundle.entry.push(servicerequestEntry);

  if (clinicalImpression) {
    const {
      id, status, age, date,
    } = clinicalImpression;

    const ciParams = {
      id, status, age, date, assessor: '',
    };
    const clinicalImpressionResource = createClinicalImpressionResource(ciParams);
    clinicalImpressionResource.subject = patientReference;
    const clinicalImpressionEntry = createEntry(clinicalImpressionResource);
    bundle.entry.push(clinicalImpressionEntry);

    // CGH
    const cghObservation = clinicalImpression.investigation[0].item.find(isCGH);
    const cghParams = {
      id: cghObservation.id,
      note: cghObservation.note,
    };
    const cghResource = createCGHResource(cghParams);
    cghResource.subject = patientReference;
    const cghEntry = createEntry(cghResource);
    bundle.entry.push(cghEntry);
    clinicalImpressionResource.investigation[0].item.push(getReference(cghEntry));

    // TODO: HPO
  }

  return bundle;
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
  const clinicalImpressionResource = bundle.entry.find(e => e.resource.resourceType === 'ClinicalImpression');

  if (clinicalImpressionResource) {
    clinicalImpressionResource.investigation[0].item.push({
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

// const addObservationReference = curry((clinicalImpressionResource, observationResource) => {
//   const ref =
// });
