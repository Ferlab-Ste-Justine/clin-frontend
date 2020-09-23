import uuidv1 from 'uuid/v1';
import intl from 'react-intl-universal';

import { has } from 'lodash';

const OBSERVATION_CGH_CODE = 'CGH';
const OBSERVATION_HPO_CODE = 'PHENO';
const OBSERVATION_INDICATION_CODE = 'INDIC';

const RESOURCE_TYPE_FAMILY_HISTORY = 'FamilyMemberHistory';
const RESOURCE_TYPE_CLINICAL_IMPRESSION = 'ClinicalImpression';
const RESOURCE_TYPE_PATIENT = 'Patient';
const RESOURCE_TYPE_BUNDLE = 'Bundle';
const RESOURCE_TYPE_SERVICE_REQUEST = 'ServiceRequest';
const RESOURCE_TYPE_OBSERVATION = 'Observation';
const RESOURCE_TYPE_PRACTITIONER = 'Practitioner';


const FERLAB_BASE_URL = 'http://fhir.cqgc.ferlab.bio';

const HL7_CODE_SYSTEM_URL = '';

export const getResourceCode = (r) => {
  try {
    return r.code.coding[0].code;
  } catch (e) {
    return null;
  }
};

export const isCGH = o => getResourceCode(o) === OBSERVATION_CGH_CODE;
export const isHPO = o => getResourceCode(o) === OBSERVATION_HPO_CODE;

export const isFamilyHistoryResource = resource => resource.resourceType === RESOURCE_TYPE_FAMILY_HISTORY;
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

  return null;
};

export const getIndicationNote = (indication) => {
  if (indication.note && indication.note.length) {
    return indication.note[0].text;
  }

  return null;
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
  resourceType: RESOURCE_TYPE_BUNDLE,
  type: 'transaction',
  entry: [],
});

export const createRequest = (resource) => {
  const {
    resourceType,
    id,
    toDelete,
  } = resource;

  let method = id ? 'PUT' : 'POST';
  if (toDelete) {
    method = 'DELETE';
  }
  return {
    method,
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
    resourceType: RESOURCE_TYPE_PATIENT,
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
  resourceType: RESOURCE_TYPE_SERVICE_REQUEST,
  id: serviceRequest ? serviceRequest.id : null,
  status: serviceRequest ? serviceRequest.status : 'draft',
  meta: {
    profile: [
      `${FERLAB_BASE_URL}/StructureDefinition/cqgc-service-request`,
    ],
  },
  extension: [
    {
      url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression',
      valueReference: {
        reference: 'ClinicalImpression/ci-001',
      },
    },
  ],
  intent: 'order',
  category: [
    {
      text: 'MedicalRequest',
    },
  ],
  priority: 'routine',
  code: {
    coding: [
      {
        system: `${FERLAB_BASE_URL}/CodeSystem/service-request-code`,
        code: 'WGS',
        display: 'Whole Genome Sequencing',
      },
    ],
  },
  subject: {
    reference: 'Patient/pt-001',
  },
  requester: {
    reference: 'Practitioner/pr-001',
  },
});

export const createClinicalImpressionResource = ({
  id, status, age, date, assessor,
}) => {
  const resource = {
    resourceType: RESOURCE_TYPE_CLINICAL_IMPRESSION,
    id,
    meta: {
      profile: [
        `${FERLAB_BASE_URL}/StructureDefinition/cqdg-clinical-impression`,
      ],
    },

    extension: [
      {
        url: `${FERLAB_BASE_URL}/StructureDefinition/age-at-event`,
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
  resourceType: RESOURCE_TYPE_OBSERVATION,
  id,
  meta: {
    profile: [
      `${FERLAB_BASE_URL}/StructureDefinition/cqgc-observation`,
    ],
  },
  status: 'final',
  category: [
    {
      coding: [
        {
          system: `${HL7_CODE_SYSTEM_URL}/observation-category`,
          code: 'laboratory',
          display: 'Laboratory',
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        system: `${FERLAB_BASE_URL}/CodeSystem/observation-code`,
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
  resourceType: RESOURCE_TYPE_OBSERVATION,
  id,
  meta: {
    profile: [
      `${FERLAB_BASE_URL}/StructureDefinition/cqgc-observation`,
    ],
  },
  status: 'final',
  category: [
    {
      coding: [
        {
          system: `${HL7_CODE_SYSTEM_URL}/observation-category`,
          code: 'exam',
          display: 'Exam',
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        system: `${FERLAB_BASE_URL}/CodeSystem/observation-code`,
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

export const createPractitionerResource = ({
  id,
  family,
  given,
  license,
}) => (
  {
    id,
    resourceType: RESOURCE_TYPE_PRACTITIONER,
    meta: {
      profile: [
        'http://hl7.org/fhir/StructureDefinition/Practitioner',
      ],
    },
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: `${HL7_CODE_SYSTEM_URL}/v2-0203`,
              code: 'MD',
              display: 'Medical License number',
            },
          ],
          text: 'Numero de License Médicale du Québec',
        },
        value: license,
      },
    ],
    name: [
      {
        use: 'official',
        family,
        given: [
          given,
        ],
        prefix: [
          'Dr.',
        ],
      },
    ],
  }
);

// TODO: Observations, Family relationships and Practitioner have been converted to resources already in the PatientSubmission form.
// patient, serviceRequest and clinicalImpression are not converted to FHIR resources yet at this point.
// They're converted in this method for now but this should be done in the patientSubmission form so that this method only has to create
// the FHIR bundle and set references right.
export const createPatientSubmissionBundle = ({
  patient,
  serviceRequest,
  clinicalImpression,
}) => {
  const patientResource = createPatientResource(patient);
  const patientEntry = createEntry(patientResource);
  const patientReference = getReference(patientEntry);

  const bundle = createBundle();
  bundle.entry.push(patientEntry);

  const serviceRequestResource = createServiceRequestResource(serviceRequest);
  serviceRequestResource.subject = patientReference;

  // We don't need to send a resource of type Practitioner
  // We only need tocreate the reference
  if (serviceRequest && has(serviceRequest, 'requester.resourceType')) {
    const practitionerEntry = createEntry(serviceRequest.requester);
    const practitionerReference = getReference(practitionerEntry);
    serviceRequestResource.requester = practitionerReference;
  }

  const serviceRequestEntry = createEntry(serviceRequestResource);
  bundle.entry.push(serviceRequestEntry);

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
    clinicalImpression.investigation[0].item.forEach((resource) => {
      // Note: this is an exception in the model. All resources should use the same field: subject
      // Or, familyHistory resources should be stored somewhere else than with observations as
      // it is not of the same kind (resourceType)
      if (isFamilyHistoryResource(resource)) {
        resource.patient = patientReference;
      } else {
        resource.subject = patientReference;
      }

      const entry = createEntry(resource);
      bundle.entry.push(entry);
      if (!resource.toDelete) {
        clinicalImpressionResource.investigation[0].item.push(getReference(entry));
      }
    });

    // reference from ServiceRequest to ClinicalImpression resource
    serviceRequestResource.extension.valueReference = getReference(clinicalImpressionEntry);
  }

  return bundle;
};

export const createFamilyHistoryMemberResource = ({
  id, code, display, note, toDelete,
}) => (
  {
    resourceType: RESOURCE_TYPE_FAMILY_HISTORY,
    id,
    toDelete,
    meta: {
      profile: [
        `${FERLAB_BASE_URL}/StructureDefinition/cqgc-fmh`,
      ],
    },
    status: 'completed',
    patient: {
      reference: 'Patient/pt-001',
    },
    relationship: {
      coding: [
        {
          code,
          display,
        },
      ],
    },
    note: [
      {
        text: note,
      },
    ],
  }
);

export const getFamilyRelationshipCode = (resource) => {
  try {
    const { relationship } = resource;
    const { coding } = relationship;
    const { code } = coding[0];
    return code;
  } catch (e) {
    return '';
  }
};

export const getFamilyRelationshipDisplay = (resource) => {
  try {
    const { relationship } = resource;
    const { coding } = relationship;
    const { display } = coding[0];
    return display;
  } catch (e) {
    return '';
  }
};

export const getFamilyRelationshipNote = (resource) => {
  try {
    const { note } = resource;
    const { text } = note[0];
    return text;
  } catch (e) {
    return '';
  }
};

export const createHPOResource = ({
  id, toDelete, hpoCode, onset, category, interpretation, note,
}) => ({
  resourceType: RESOURCE_TYPE_OBSERVATION,
  id,
  toDelete,
  meta: {
    profile: [
      `${FERLAB_BASE_URL}/StructureDefinition/cqgc-observation`,
    ],
  },
  extension: [
    {
      url: `${FERLAB_BASE_URL}/StructureDefinition/age-at-onset`,
      valueCoding: onset,
    },
    {
      url: `${FERLAB_BASE_URL}/StructureDefinition/hpo-category`,
      valueCoding: category,
    },
  ],
  status: 'final',
  category: [
    {
      coding: [
        {
          system: `${HL7_CODE_SYSTEM_URL}/observation-category`,
          code: 'exam',
          display: 'Exam',
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        system: `${FERLAB_BASE_URL}/CodeSystem/observation-code`,
        code: 'PHENO',
        display: 'phenotype',
      },
    ],
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
          system: `${HL7_CODE_SYSTEM_URL}/v3-ObservationInterpretation`,
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

export const getResourceId = (resource) => {
  try {
    return resource.id;
  } catch (e) {
    return '';
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

export const getFamilyRelationshipValues = () => ({
  father: {
    value: 'FTH',
    label: intl.get('form.patientSubmission.form.father'),
  },
  mother: {
    value: 'MTH',
    label: intl.get('form.patientSubmission.form.mother'),
  },
  brother: {
    value: 'BRO',
    label: intl.get('form.patientSubmission.form.brother'),
  },
  sister: {
    value: 'SIS',
    label: intl.get('form.patientSubmission.form.sister'),
  },
  halfBrother: {
    value: 'HBRO',
    label: intl.get('form.patientSubmission.form.halfBrother'),
  },
  halfSister: {
    value: 'HSIS',
    label: intl.get('form.patientSubmission.form.halfSister'),
  },
  identicalTwin: {
    value: 'ITWIN',
    label: intl.get('form.patientSubmission.form.identicalTwin'),
  },
  fraternalTwin: {
    value: 'FTWIN',
    label: intl.get('form.patientSubmission.form.fraternalTwin'),
  },
  daughter: {
    value: 'DAUC',
    label: intl.get('form.patientSubmission.form.daughter'),
  },
  son: {
    value: 'SONC',
    label: intl.get('form.patientSubmission.form.son'),
  },
  maternalAunt: {
    value: 'MAUNT',
    label: intl.get('form.patientSubmission.form.maternalAunt'),
  },
  paternalAunt: {
    value: 'PAUNT',
    label: intl.get('form.patientSubmission.form.paternalAunt'),
  },
  maternalUncle: {
    value: 'MUNCLE',
    label: intl.get('form.patientSubmission.form.maternalUncle'),
  },
  paternalUncle: {
    value: 'PUNCHE',
    label: intl.get('form.patientSubmission.form.paternalUncle'),
  },
  maternalCousin: {
    value: 'MCOUSIN',
    label: intl.get('form.patientSubmission.form.maternalCousin'),
  },
  paternalCousin: {
    value: 'PCOUSIN',
    label: intl.get('form.patientSubmission.form.paternalCousin'),
  },
  maternalGrandfather: {
    value: 'MGRFTH',
    label: intl.get('form.patientSubmission.form.maternalGrandfather'),
  },
  paternalGrandfather: {
    value: 'PGRFTH',
    label: intl.get('form.patientSubmission.form.paternalGrandfather'),
  },
  maternalGrandmother: {
    value: 'MGRMTH',
    label: intl.get('form.patientSubmission.form.maternalGrandmother'),
  },
  paternalGrandmother: {
    value: 'PGRMTH',
    label: intl.get('form.patientSubmission.form.paternalGrandmother'),
  },
  nephew: {
    value: 'NEPHEW',
    label: intl.get('form.patientSubmission.form.nephew'),
  },
  niece: {
    value: 'NIECE',
    label: intl.get('form.patientSubmission.form.niece'),
  },
  maternalMember: {
    value: 'MATMEM',
    label: intl.get('form.patientSubmission.form.maternalMember'),
  },
  paternalMember: {
    value: 'PATMEM',
    label: intl.get('form.patientSubmission.form.paternalMember'),
  },
});

export const getFamilyRelationshipDisplayForCode = (code) => {
  try {
    return Object.values(getFamilyRelationshipValues()).find(v => v.value === code).label;
  } catch (e) {
    return '';
  }
};

export const STATE_CLINICAL_IMPRESSION = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ENTERED_IN_ERROR: 'entered-in-error',
};
