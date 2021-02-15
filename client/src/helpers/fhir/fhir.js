import intl from 'react-intl-universal';
import get from 'lodash/get';

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

export const genPractitionerKey = (practitioner) => `${practitioner.family.toUpperCase()} ${practitioner.given} – ${practitioner.license}`;

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
  N: 'N',
  IND: 'IND',
};
export const CGH_VALUES = () => (
  [
    { value: CGH_CODES.A, display: 'Anormal' },
    { value: CGH_CODES.N, display: 'Normal' },
    { value: CGH_CODES.IND, display: 'Indéterminé' },
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

export const createGetPatientDataBundle = (id) => (
  {
    resourceType: 'Bundle',
    id: 'bundle-request-patient-data',
    type: 'batch',
    entry: [
      {
        request: {
          method: 'GET',
          url: `Patient?_id=${id}&_include=Patient:general-practitioner&_include=Patient:organization`,
        },
      },
      {
        request: {
          method: 'GET',
          url: `Group?member=${id}`,
        },
      },
      {
        request: {
          method: 'GET',
          url: `/ServiceRequest?subject=${id}&_include=ServiceRequest:requester&_include=ServiceRequest:performer`,
        },
      },
      {
        request: {
          method: 'GET',
          url: `/ClinicalImpression?patient=${id}&_include=ClinicalImpression:assessor&_include=ClinicalImpression:investigation`,
        },
      },
    ],
  }
);

export const createGetPractitionersDataBundle = (data) => {
  const practitionerRoleIds = [];
  const practitionerIds = [];
  data.entry.forEach((bundle) => {
    if (bundle.resource.entry != null) {
      bundle.resource.entry.forEach((entry) => {
        if (get(entry, 'resource.resourceType', '') === 'PractitionerRole' && practitionerRoleIds.find((id) => id === entry.resource.id) == null) {
          practitionerRoleIds.push(entry.resource.id);
        } else if (get(entry, 'resource.resourceType', '') === 'Practitioner' && practitionerIds.find((id) => id === entry.resource.id) == null) {
          practitionerIds.push(entry.resource.id);
        }
      });
    }
  });
  const output = {
    resourceType: 'Bundle',
    id: 'bundle-request-practitioner-data',
    type: 'batch',
    entry: [],
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

  // const serviceRequestEntries = get(data, 'entry[2].resource.entry', []);
  // if (serviceRequestEntries.length > 1) {
  //   const id = get(serviceRequestEntries, '[1].resource.id', null);
  //   if (id != null) {
  //     output.entry.push(
  //       {
  //         request: {
  //           method: 'GET',
  //           url: `/PractitionerRole?practitioner=${id}&_include=PractitionerRole:organization`,
  //         },
  //       },
  //     );
  //   }
  // }

  return output;
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
    iconClass: 'observedIcon',
    value: 'POS',
    display: 'Observé',
  },
  {
    iconClass: 'notObservedIcon',
    value: 'NEG',
    display: 'Non-observé',
  },
  {
    iconClass: 'unknownIcon',
    value: 'IND',
    display: 'Inconnu',
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
        value: 'Infantile onset',
        display: 'Infantile',
      },
      {
        code: 'HP:0011463',
        value: 'Childhood onset',
        display: 'Childhood',
      },
      {
        code: 'HP:0003621',
        value: 'Juvenile onset',
        display: 'Juvenile',
      },
    ],
  },
  {
    groupLabel: 'Adult onset',
    options: [
      {
        code: 'HP:0011462',
        value: 'YoungAdult onset',
        display: 'Young adult',
      },
      {
        code: 'HP:0003596',
        value: 'MiddleAge onset',
        display: 'Middle age',
      },
      {
        code: 'HP:0003584',
        value: 'Late onset',
        display: 'Late',
      },
    ],
  },
  {
    groupLabel: 'Antenatal onset',
    options: [
      {
        code: 'HP:0011460',
        value: 'Embryonal onset',
        display: 'Embryonal',
      },
      {
        code: 'HP:0011461',
        value: 'Fetal onset',
        display: 'Fetal',
      },
    ],
  },
  {
    groupLabel: 'Neonatal onset',
    options: [
      {
        code: 'HP:0003623',
        value: 'Neonatal onset',
        display: 'Neonatal',
      },
    ],
  },
  {
    groupLabel: 'Congenital onset',
    options: [
      {
        code: 'HP:0003577',
        value: 'Congenital onset',
        display: 'Congenital',
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
    return Object.values(getFamilyRelationshipValues()).find((v) => v.value === code).label;
  } catch (e) {
    return '';
  }
};

export const STATE_CLINICAL_IMPRESSION = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ENTERED_IN_ERROR: 'entered-in-error',
};
