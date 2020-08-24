/* eslint-disable no-unused-vars */
import moment from 'moment';
import { curry, runInContext } from 'lodash';

import uuidv1 from 'uuid/v1';
import intl from 'react-intl-universal';

const OBSERVATION_CGH_CODE = 'CGH';
const OBSERVATION_HPO_CODE = 'PHENO';
const OBSERVATION_INDICATION_CODE = 'INDIC';

export const getResourceCode = r => r.code.coding[0].code;
export const isCGH = o => getResourceCode(o) === OBSERVATION_CGH_CODE;
export const isHPO = o => getResourceCode(o) === OBSERVATION_HPO_CODE;
export const isIndication = o => getResourceCode(o) === OBSERVATION_INDICATION_CODE;

export const cghInterpretation = (cgh) => {
  if (cgh.interpretation && cgh.interpretation.length) {
    const [interpretation] = cgh.interpretation;
    const [interpretationValue] = interpretation.coding;
    return interpretationValue;
  }
  return null;
};

export const cghNote = (cgh) => {
  if (cgh.note && cgh.note.length) {
    return cgh.note[0].text;
  }

  return null;
};

export const indicationNote = (indication) => {
  if (indication.note && indication.note.length) {
    return indication.note[0].text;
  }

  return null;
};

// TODO: translate/intl
export const CGH_CODES = {
  A: 'A',
  N: 'N',
};
export const CGH_VALUES = () => (
  [
    { value: CGH_CODES.A, display: 'Anormal' },
    { value: CGH_CODES.N, display: 'Négatif' },
    { value: null, display: 'Sans objet' },
  ]
);

export const cghDisplay = (code) => {
  const item = CGH_VALUES().find(cgh => cgh.value === code);
  if (item) {
    return item.display;
  }

  return '';
};

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
  id, interpretation, note,
}) => {
  console.log();
  return {
    resourceType: 'Observation',
    id,
    meta: {
      profile: [
        'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-observation',
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
      },
    ],
    code: {
      coding: [
        {
          system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/observation-code',
          code: 'CGH',
          display: 'cgh',
        },
      ],
    },
    interpretation: [
      {
        coding: [
          interpretation,
        ],
      },
    ],
    note: [
      {
        text: note,
      },
    ],
  };
};

export const createIndicationResource = ({ id, note }) => {
  console.log();
  return {
    resourceType: 'Observation',
    id,
    meta: {
      profile: [
        'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-observation',
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
      },
    ],
    code: {
      coding: [
        {
          system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/observation-code',
          code: 'INDIC',
          display: 'indications',
        },
      ],
    },
    note: [
      {
        text: note,
      },
    ],
  };
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
    const cghResource = clinicalImpression.investigation[0].item.find(isCGH);
    cghResource.subject = patientReference;
    const cghEntry = createEntry(cghResource);
    bundle.entry.push(cghEntry);
    clinicalImpressionResource.investigation[0].item.push(getReference(cghEntry));

    // TODO: HPO

    // Indication
    const indicationResource = clinicalImpression.investigation[0].item.find(isIndication);
    indicationResource.subject = patientReference;
    const indicationEntry = createEntry(indicationResource);
    bundle.entry.push(indicationEntry);
    clinicalImpressionResource.investigation[0].item.push(getReference(indicationEntry));
  }

  return bundle;
};

const createHPOResource = ({
  hpoCode, onset, category, interpretation, note,
}) => {
  console.log();

  return {
    resourceType: 'Observation',
    id: 'ph-001',
    meta: {
      profile: [
        'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-observation',
      ],
    },
    extension: [
      {
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset',
        valueCoding: onset,
      },
      {
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/hpo-category',
        valueCoding: category,
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
      },
    ],
    code: {
      coding: [
        {
          system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/observation-code',
          code: 'PHENO',
          display: 'phenotype',
        },
      ],
    },
    subject: {
      reference: 'Patient/pt-001',
    },
    valueCodeableConcept: {
      coding: [
        {
          system: 'http://purl.obolibrary.org/obo/hp.owl',
          ...hpoCode,
        },
      ],
    },
    interpretation: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            ...interpretation,
          },
        ],
        text: 'Observé',
      },
    ],
    note: [
      {
        text: note,
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
        text: 'Indications - hypothèse(s) de diagnostic',
      },
    ],
    code: { text: 'investigations' },
    subject: { reference: 'Patient/pt-001' },
    note: [{ text: "Resume de l'investigation clinique et paraclinique realisees" }],
  };
};

// 1. Create clinicalImpression resource
// 2. Add clinical impression entry to bundle ({resource:---, request: ---})
// 3. Create observation resource
// 4. Add observation entry to bundle (will have to look for clinical impression resource to add reference to observation. Observation resource needs a fullUrl field to serve as reference target)

export const STATE_CLINICAL_IMPRESSION = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ENTERED_IN_ERROR: 'entered-in-error',
};

// const addObservationReference = curry((clinicalImpressionResource, observationResource) => {
//   const ref =
// });
