import intl from 'react-intl-universal';
import get from 'lodash/get';

const BUNDLE_COUNT = 100

const OBSERVATION_CGH_CODE = 'CGH';
const OBSERVATION_HPO_CODE = 'PHENO';
const OBSERVATION_INDICATION_CODE = 'INDIC';

const RESOURCE_TYPE_FAMILY_HISTORY = 'FamilyMemberHistory';
const RESOURCE_TYPE_CLINICAL_IMPRESSION = 'ClinicalImpression';
const RESOURCE_TYPE_BUNDLE = 'Bundle';
const RESOURCE_TYPE_OBSERVATION = 'Observation';
const RESOURCE_TYPE_PRACTITIONER = 'Practitioner';

const FERLAB_BASE_URL = 'http://fhir.cqgc.ferlab.bio';

const HL7_CODE_SYSTEM_URL = '';


export const genPractitionerKey = (practitioner) => (
  `${practitioner.family.toUpperCase()} ${practitioner.given} – ${practitioner.license}`
);

export const getResourceCode = (r) => {
  try {
    return r.code.coding[0].code;
  } catch (e) {
    return null;
  }
};

export const isCGH = (o) => getResourceCode(o) === OBSERVATION_CGH_CODE;
export const isHPO = (o) => getResourceCode(o) === OBSERVATION_HPO_CODE;

export const isFamilyHistoryResource = (resource) => resource.resourceType === RESOURCE_TYPE_FAMILY_HISTORY;
export const isIndication = (o) => getResourceCode(o) === OBSERVATION_INDICATION_CODE;

export const getObservationValue = (obs, defaultValue) => (
  get(obs, 'valueString', get(obs, 'note[0].text', defaultValue))
)

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
    return cghResource.interpretation[0].coding[0].code;
  } catch (e) {
    return null;
  }
};

export const resourceNote = (resource) => {
  if (resource.note && resource.note.length) {
    return resource.note[0].text;
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
  IND: 'IND',
  N: 'N',
};
export const CGH_VALUES = () => (
  [
    { display: 'Anormal', value: CGH_CODES.A },
    { display: 'Normal', value: CGH_CODES.N },
    { display: 'Indéterminé', value: CGH_CODES.IND },
  ]
);

export const cghDisplay = (code) => {
  const item = CGH_VALUES().find((cgh) => cgh.value === code);
  if (item) {
    return item.display;
  }

  return '';
};

export const createBundle = () => ({
  entry: [],
  resourceType: RESOURCE_TYPE_BUNDLE,
  type: 'transaction',
});

export const createRequest = (resource) => {
  const {
    id,
    resourceType,
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

export const createClinicalImpressionResource = ({
  age, assessor, date, id, status,
}) => {
  const resource = {
    assessor: { reference: assessor },
    date,
    description: 'This source refers to the consultation with the doctor',

    extension: [
      {
        url: `${FERLAB_BASE_URL}/StructureDefinition/age-at-event`,
        valueAge: {
          code: 'd',
          system: 'http://unitsofmeasure.org',
          unit: 'days',
          value: age,
        },
      },
    ],

    id,
    investigation: [
      {
        code: {
          text: 'initial-examination',
        },
        item: [],
      },
    ],
    meta: {
      profile: [
        `${FERLAB_BASE_URL}/StructureDefinition/cqdg-clinical-impression`,
      ],
    },
    resourceType: RESOURCE_TYPE_CLINICAL_IMPRESSION,
    status,
  };

  return resource;
};

export const createCGHResource = ({
  id, interpretation, note,
}) => ({
  category: [
    {
      coding: [
        {
          code: 'laboratory',
          display: 'Laboratory',
          system: `${HL7_CODE_SYSTEM_URL}/observation-category`,
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        code: 'CGH',
        display: 'cgh',
        system: `${FERLAB_BASE_URL}/CodeSystem/observation-code`,
      },
    ],
  },
  id,
  interpretation: [
    {
      coding: [
        interpretation,
      ],
    },
  ],
  meta: {
    profile: [
      `${FERLAB_BASE_URL}/StructureDefinition/cqgc-observation`,
    ],
  },
  note: [
    {
      text: note,
    },
  ],
  resourceType: RESOURCE_TYPE_OBSERVATION,
  status: 'final',
});

export const createIndicationResource = ({ id, note }) => ({
  category: [
    {
      coding: [
        {
          code: 'exam',
          display: 'Exam',
          system: `${HL7_CODE_SYSTEM_URL}/observation-category`,
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        code: 'INDIC',
        display: 'indications',
        system: `${FERLAB_BASE_URL}/CodeSystem/observation-code`,
      },
    ],
  },
  id,
  meta: {
    profile: [
      `${FERLAB_BASE_URL}/StructureDefinition/cqgc-observation`,
    ],
  },
  note: [
    {
      text: note,
    },
  ],
  resourceType: RESOURCE_TYPE_OBSERVATION,
  status: 'final',
});

export const createPractitionerResource = ({
  family,
  given,
  id,
  license,
}) => (
  {
    id,
    identifier: [
      {
        type: {
          coding: [
            {
              code: 'MD',
              display: 'Medical License number',
              system: `${HL7_CODE_SYSTEM_URL}/v2-0203`,
            },
          ],
          text: 'Numero de License Médicale du Québec',
        },
        use: 'official',
        value: license,
      },
    ],
    meta: {
      profile: [
        'http://hl7.org/fhir/StructureDefinition/Practitioner',
      ],
    },
    name: [
      {
        family,
        given: [
          given,
        ],
        prefix: [
          'Dr.',
        ],
        use: 'official',
      },
    ],
    resourceType: RESOURCE_TYPE_PRACTITIONER,
  }
);

const buildPatientEntry = (id, withIncludes = true) => (
  {
    request: {
      method: 'GET',
      url: `Patient?_id=${id}${withIncludes ? '&_include=Patient:general-practitioner&_include=Patient:organization' : ''}`,
    },
  }
);

const buildPractitionerEntry = (id) => (
  {
    request: {
      method: 'GET',
      url: `Practitioner?_id=${id}`,
    },
  }
);

export const createGetMultiplePatientDataBundle = (ids, withIncludes = true) => (
  {
    entry: ids.map((id) => buildPatientEntry(id, withIncludes)),
    id: 'bundle-request-patients-data',
    resourceType: 'Bundle',
    type: 'batch',
  }
);

export const createGetMultiplePractitionerDataBundle = (ids) => (
  {
    entry: ids.map((id) => buildPractitionerEntry(id)),
    id: 'bundle-request-practitioner-data',
    resourceType: 'Bundle',
    type: 'batch',
  }
);

export const createGetPatientDataBundle = (id, withIncludes = true) => (
  {
    entry: [
      buildPatientEntry(id, withIncludes),
      {
        request: {
          method: 'GET',
          url: `Group?member=${id}`,
        },
      },
      {
        request: {
          method: 'GET',
          url: `/ServiceRequest?subject=${id}&_include=ServiceRequest:requester&_include=ServiceRequest:performer&_count=${BUNDLE_COUNT}`,
        },
      },
      {
        request: {
          method: 'GET',
          // eslint-disable-next-line max-len
          url: `/ClinicalImpression?patient=${id}&_include=ClinicalImpression:assessor&_include=ClinicalImpression:investigation&_count=${BUNDLE_COUNT}`,
        },
      },
    ],
    id: 'bundle-request-patient-data',
    resourceType: 'Bundle',
    type: 'batch',
  }
);

export const createGetPractitionersDataBundle = (data) => {
  const practitionerRoleIds = [];
  const practitionerIds = [];
  data.entry.forEach((bundle) => {
    if (bundle.resource.entry != null) {
      bundle.resource.entry.forEach((entry) => {
        if (get(entry, 'resource.resourceType', '') === 'PractitionerRole'
          && practitionerRoleIds.find((id) => id === entry.resource.id) == null) {
          practitionerRoleIds.push(entry.resource.id);
        } else if (get(entry, 'resource.resourceType', '') === 'Practitioner'
          && practitionerIds.find((id) => id === entry.resource.id) == null) {
          practitionerIds.push(entry.resource.id);
        }
      });
    }
  });
  const output = {
    entry: [],
    id: 'bundle-request-practitioner-data',
    resourceType: 'Bundle',
    type: 'batch',
  };

  practitionerRoleIds.forEach((id) => {
    output.entry.push(
      {
        request: {
          method: 'GET',
          url: `/PractitionerRole?_id=${id}&_include=PractitionerRole:organization&_include=PractitionerRole:practitioner`,
        },
      },
    );
  });

  practitionerIds.forEach((id) => {
    output.entry.push(
      {
        request: {
          method: 'GET',
          url: `/PractitionerRole?practitioner=${id}&_include=PractitionerRole:organization`,
        },
      },
    );
  });

  return output;
};

export const createFamilyHistoryMemberResource = ({
  code, display, id, note, toDelete,
}) => (
  {
    id,
    meta: {
      profile: [
        `${FERLAB_BASE_URL}/StructureDefinition/cqgc-fmh`,
      ],
    },
    note: [
      {
        text: note,
      },
    ],
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
    resourceType: RESOURCE_TYPE_FAMILY_HISTORY,
    status: 'completed',
    toDelete,
  }
);

export const getFamilyRelationshipCode = (resource) => {
  try {
    const { relationship } = resource;
    const { coding } = relationship;
    const { code } = coding[0];
    if (code === '') {
      return undefined;
    }
    return code;
  } catch (e) {
    return undefined;
  }
};

export const getFamilyRelationshipDisplay = (resource) => {
  try {
    const { relationship } = resource;
    const { coding } = relationship;
    const { display } = coding[0];
    if (display === '') {
      return undefined;
    }
    return display;
  } catch (e) {
    return undefined;
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
  category, hpoCode, id, interpretation, note, onset, toDelete,
}) => ({
  category: [
    {
      coding: [
        {
          code: 'exam',
          display: 'Exam',
          system: `${HL7_CODE_SYSTEM_URL}/observation-category`,
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        code: 'PHENO',
        display: 'phenotype',
        system: `${FERLAB_BASE_URL}/CodeSystem/observation-code`,
      },
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
  id,
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
  meta: {
    profile: [
      `${FERLAB_BASE_URL}/StructureDefinition/cqgc-observation`,
    ],
  },
  note: [
    {
      text: note,
    },
  ],
  resourceType: RESOURCE_TYPE_OBSERVATION,
  status: 'final',
  toDelete,
  valueCodeableConcept: {
    coding: [
      {
        system: 'http://purl.obolibrary.org/obo/hp.owl',
        ...hpoCode,
      },
    ],
  },
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
    return resource.extension[0].valueCoding.code;
  } catch (e) {
    return undefined;
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

export const hpoInterpretationValues = () => [
  {
    display: 'Observé',
    iconClass: 'observedIcon',
    value: 'POS',
  },
  {
    display: 'Non-observé',
    iconClass: 'notObservedIcon',
    value: 'NEG',
  },
  {
    display: 'Inconnu',
    iconClass: 'unknownIcon',
    value: 'IND',
  },
];

export const getHPOInterpretationCode = (resource) => {
  try {
    return resource.interpretation[0].coding[0].code;
  } catch (e) {
    return undefined;
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
        code: 'HP:0003593',
        display: 'Infantile',
        value: 'Infantile onset',
      },
      {
        code: 'HP:0011463',
        display: 'Childhood',
        value: 'Childhood onset',
      },
      {
        code: 'HP:0003621',
        display: 'Juvenile',
        value: 'Juvenile onset',
      },
    ],
  },
  {
    groupLabel: 'Adult onset',
    options: [
      {
        code: 'HP:0011462',
        display: 'Young adult',
        value: 'YoungAdult onset',
      },
      {
        code: 'HP:0003596',
        display: 'Middle age',
        value: 'MiddleAge onset',
      },
      {
        code: 'HP:0003584',
        display: 'Late',
        value: 'Late onset',
      },
    ],
  },
  {
    groupLabel: 'Antenatal onset',
    options: [
      {
        code: 'HP:0011460',
        display: 'Embryonal',
        value: 'Embryonal onset',
      },
      {
        code: 'HP:0011461',
        display: 'Fetal',
        value: 'Fetal onset',
      },
    ],
  },
  {
    groupLabel: 'Neonatal onset',
    options: [
      {
        code: 'HP:0003623',
        display: 'Neonatal',
        value: 'Neonatal onset',
      },
    ],
  },
  {
    groupLabel: 'Congenital onset',
    options: [
      {
        code: 'HP:0003577',
        display: 'Congenital',
        value: 'Congenital onset',
      },
    ],
  },
];

export const hpoInterpretationDisplayForCode = (code) => {
  try {
    return hpoInterpretationValues().find((v) => v.value === code).display;
  } catch (e) {
    return '';
  }
};

export const getHPOOnsetDisplayFromCode = (code) => {
  try {
    return hpoOnsetValues()
      .reduce((acc, group) => [...acc, ...group.options], [])
      .find((option) => option.code === code)
      .display;
  } catch (e) {
    return '';
  }
};

export const getFamilyRelationshipValues = () => ({
  brother: {
    label: intl.get('form.patientSubmission.form.brother'),
    value: 'BRO',
  },
  daughter: {
    label: intl.get('form.patientSubmission.form.daughter'),
    value: 'DAUC',
  },
  father: {
    label: intl.get('form.patientSubmission.form.father'),
    value: 'FTH',
  },
  fraternalTwin: {
    label: intl.get('form.patientSubmission.form.fraternalTwin'),
    value: 'FTWIN',
  },
  halfBrother: {
    label: intl.get('form.patientSubmission.form.halfBrother'),
    value: 'HBRO',
  },
  halfSister: {
    label: intl.get('form.patientSubmission.form.halfSister'),
    value: 'HSIS',
  },
  identicalTwin: {
    label: intl.get('form.patientSubmission.form.identicalTwin'),
    value: 'ITWIN',
  },
  maternalAunt: {
    label: intl.get('form.patientSubmission.form.maternalAunt'),
    value: 'MAUNT',
  },
  maternalCousin: {
    label: intl.get('form.patientSubmission.form.maternalCousin'),
    value: 'MCOUSIN',
  },
  maternalGrandfather: {
    label: intl.get('form.patientSubmission.form.maternalGrandfather'),
    value: 'MGRFTH',
  },
  maternalGrandmother: {
    label: intl.get('form.patientSubmission.form.maternalGrandmother'),
    value: 'MGRMTH',
  },
  maternalMember: {
    label: intl.get('form.patientSubmission.form.maternalMember'),
    value: 'MATMEM',
  },
  maternalUncle: {
    label: intl.get('form.patientSubmission.form.maternalUncle'),
    value: 'MUNCLE',
  },
  mother: {
    label: intl.get('form.patientSubmission.form.mother'),
    value: 'MTH',
  },
  nephew: {
    label: intl.get('form.patientSubmission.form.nephew'),
    value: 'NEPHEW',
  },
  niece: {
    label: intl.get('form.patientSubmission.form.niece'),
    value: 'NIECE',
  },
  paternalAunt: {
    label: intl.get('form.patientSubmission.form.paternalAunt'),
    value: 'PAUNT',
  },
  paternalCousin: {
    label: intl.get('form.patientSubmission.form.paternalCousin'),
    value: 'PCOUSIN',
  },
  paternalGrandfather: {
    label: intl.get('form.patientSubmission.form.paternalGrandfather'),
    value: 'PGRFTH',
  },
  paternalGrandmother: {
    label: intl.get('form.patientSubmission.form.paternalGrandmother'),
    value: 'PGRMTH',
  },
  paternalMember: {
    label: intl.get('form.patientSubmission.form.paternalMember'),
    value: 'PATMEM',
  },
  paternalUncle: {
    label: intl.get('form.patientSubmission.form.paternalUncle'),
    value: 'PUNCHE',
  },
  sister: {
    label: intl.get('form.patientSubmission.form.sister'),
    value: 'SIS',
  },
  son: {
    label: intl.get('form.patientSubmission.form.son'),
    value: 'SONC',
  },
});

export const getFamilyRelationshipDisplayForCode = (code) => {
  try {
    return Object.values(getFamilyRelationshipValues()).find((v) => v.value === code).label;
  } catch (e) {
    return '';
  }
};

export const STATE_CLINICAL_IMPRESSION = {
  COMPLETED: 'completed',
  ENTERED_IN_ERROR: 'entered-in-error',
  IN_PROGRESS: 'in-progress',
};
