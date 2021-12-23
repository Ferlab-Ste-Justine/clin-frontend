import intl from 'react-intl-universal';
import get from 'lodash/get';

const BUNDLE_COUNT = 100
const RESOURCE_TYPE_PRACTITIONER = 'Practitioner';

const HL7_CODE_SYSTEM_URL = '';


export const genPractitionerKey = (practitioner) => (
  `${practitioner.family.toUpperCase()} ${practitioner.given} – ${practitioner.license}`
);

export const getObservationValue = (obs, defaultValue) => (
  get(obs, 'valueString', get(obs, 'note[0].text', defaultValue))
)

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

export const getResourceId = (resource) => resource?.id || '' ;

export const getHPOOnsetCode = (resource) => resource?.extension?.[0]?.valueCoding?.code;

export const getHPODisplay = (resource) => resource?.valueCodeableConcept?.coding?.[0]?.display || '';

export const getHPOCode = (resource) => resource?.valueCodeableConcept?.coding?.[0]?.code || '';

export const getHPOInterpretationCode = (resource) => resource?.interpretation?.[0]?.coding?.[0]?.code;

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

export const getFamilyRelationshipDisplayForCode = (code) => Object.values(getFamilyRelationshipValues()).find((v) => v.value === code)?.label || '';