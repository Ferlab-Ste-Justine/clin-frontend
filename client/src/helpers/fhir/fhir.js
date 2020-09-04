/* eslint-disable no-unused-vars */
import uuidv1 from 'uuid/v1';

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

export const getCGHInterpretationCode = (cghResource) => {
  try {
    return cghResource.interpretation[0].coding[0].value;
  } catch (e) {
    return null;
  }
};

export const cghNote = (cgh) => {
  if (cgh.note && cgh.note.length) {
    return cgh.note[0].text;
  }

  return '';
};

export const getIndicationNote = (indication) => {
  if (indication.note && indication.note.length) {
    return indication.note[0].text;
  }

  return '';
};

export const getIndicationId = (indication) => {
  try {
    return indication.id;
  } catch (e) {
    return null;
  }
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
const createEntry = resource => ({
  fullUrl: createFullUrl(resource),
  resource,
  request: createRequest(resource),
});

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

const createServiceRequestResource = serviceRequest => ({
  resourceType: 'ServiceRequest',
  id: serviceRequest ? serviceRequest.id : null,
  status: serviceRequest ? serviceRequest.status : 'draft',
});

export const createClinicalImpressionResource = ({
  id, status, age, date, assessor,
}) => {
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
}) => ({
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
});

export const createIndicationResource = ({ id, note }) => ({
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
});

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

    clinicalImpression.investigation[0].item.forEach((resource) => {
      resource.subject = patientReference;
      const entry = createEntry(resource);
      bundle.entry.push(entry);
      clinicalImpressionResource.investigation[0].item.push(getReference(entry));
    });
  }

  return bundle;
};

export const createHPOResource = ({
  hpoCode, onset, category, interpretation, note,
}) => ({
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
});

export const getHPOId = (resource) => {
  try {
    return resource.id;
  } catch (e) {
    return '';
  }
};

export const getResourceToBeDeletedStatus = (resource) => {
  try {
    return !!resource.toBeDeleted;
  } catch (e) {
    return false;
  }
};

export const getHPOOnsetCode = (resource) => {
  try {
    return resource.extension[0].valueCoding.value;
  } catch (e) {
    return '';
  }
};

export const getHPODisplay = (resource) => {
  try {
    return resource.valueCodeableConcept.coding[0].display;
  } catch (e) {
    return '';
  }
};

export const getHPOCode = (resource) => {
  try {
    return resource.valueCodeableConcept.coding[0].code;
  } catch (e) {
    return '';
  }
};

export const getHPOInterpretationDisplay = (resource) => {
  try {
    return resource.interpretation[0].coding[0].display;
  } catch (e) {
    return '';
  }
};

export const getHPOInterpretationCode = (resource) => {
  try {
    return resource.interpretation[0].coding[0].code;
  } catch (e) {
    return '';
  }
};

export const getHPONote = (resource) => {
  try {
    return resource.note.text;
  } catch (e) {
    return '';
  }
};

export const hpoOnsetValues = [
  {
    groupLabel: 'Pediatric onset',
    options: [
      {
        value: 'Juvenile onset',
        display: 'Juvenile',
      },
      {
        value: 'Childhood onset',
        display: 'Childhood',
      },
      {
        value: 'Infantile onset',
        display: 'Infantile',
      },
    ],
  },
  {
    groupLabel: 'Adult onset',
    options: [
      {
        value: 'YoungAdult onset',
        display: 'Young adult',
      },
      {
        value: 'MiddleAge onset',
        display: 'Middle age',
      },
      {
        value: 'Late onset',
        display: 'Late',
      },
    ],
  },
  {
    groupLabel: 'Antenatal onset',
    options: [
      {
        value: 'Embryonal onset',
        display: 'Embryonal',
      },
      {
        value: 'Fetal onset',
        display: 'Fetal',
      },
    ],
  },
  {
    groupLabel: 'Neonatal onset',
    options: [
      {
        value: 'Neonatal onset',
        display: 'Neonatal',
      },
    ],
  },
  {
    groupLabel: 'Congenital onset',
    options: [
      {
        value: 'Congenital onset',
        display: 'Congenital',
      },
    ],
  },
];

export const hpoInterpretationValues = () => [
  {
    iconClass: 'observedIcon',
    value: 'O',
    display: 'Observé',
  },
  {
    iconClass: 'notObservedIcon',
    value: 'NO',
    display: 'Non-observé',
  },
  {
    iconClass: 'unknownIcon',
    value: 'I',
    display: 'Inconnu',
  },
];

export const hpoInterpretationDisplayForCode = (code) => {
  try {
    return hpoInterpretationValues().find(v => v.value === code).display;
  } catch (e) {
    return '';
  }
};

export const getHPOOnsetDisplayFromCode = (code) => {
  try {
    return hpoOnsetValues()
      .reduce((acc, group) => [...acc, ...group.options], [])
      .find(option => option.code === code)
      .display;
  } catch (e) {
    return '';
  }
};

const createInvestigationSummaryResource = () => ({
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
});

export const STATE_CLINICAL_IMPRESSION = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ENTERED_IN_ERROR: 'entered-in-error',
};
