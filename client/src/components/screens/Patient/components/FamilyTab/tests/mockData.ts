export const patientProbandSubState = {
  patient: {
    canEdit: false,
    family: [
      {
        birthDate: '1900-09-10',
        firstName: 'Galilei',
        gender: 'male',
        id: '167264',
        isFetus: false,
        isProband: true,
        lastName: 'Galileo',
        ramq: 'GGAL190002021',
      },
      {
        birthDate: '2021-06-15',
        firstName: 'Claudia',
        gender: 'female',
        id: '37705',
        isFetus: false,
        isProband: false,
        lastName: 'Roy',
        ramq: 'ROYC00000011',
        relationCode: 'MTH',
      },
      {
        birthDate: '1988-10-01',
        firstName: 'Theodore',
        gender: 'male',
        id: 'PA0028',
        isFetus: false,
        isProband: false,
        lastName: 'Lavoie',
        ramq: 'LAVT88100165',
        relationCode: 'FTH',
      },
    ],
    idsOfParentUpdatingStatuses: [],
    patient: {
      original: {
        identifier: [
          {
            assigner: { reference: 'Organization/CHUM' },
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
            value: 'CHUM1000CR',
          },
          {
            type: {
              coding: [
                {
                  code: 'JHN',
                  display: 'Jurisdictional health number (Canada)',
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                },
              ],
              text: 'Numéro du dossier médical',
            },
            value: 'GGAL190002021',
          },
        ],
        name: [{ family: 'Galileo', given: ['Galilei'] }],
      },
      parsed: {
        birthDate: '1900-09-10',
        bloodRelationship: 'N/A',
        ethnicity: 'N/A',
        familyId: '167265',
        familyRelation: '37705',
        familyType: 'person',
        firstName: 'Galilei',
        gender: 'male',
        id: '167264',
        isFetus: false,
        lastName: 'Galileo',
        mrn: [{ hospital: 'CHUM', number: 'CHUM1000CR' }],
        organization: "Centre hospitalier de l'Université de Montréal",
        proband: 'Proband',
        ramq: 'GGAL190002021',
        status: 'active',
      },
    },
  },
};

export const patientNotProbandSubState = {
  patient: {
    canEdit: true,
    family: [
      {
        birthDate: '1984-09-21',
        firstName: 'Sully',
        gender: 'female',
        id: '181284',
        isFetus: false,
        isProband: true,
        lastName: 'Bush',
        ramq: 'SBUS123456789',
      },
      {
        birthDate: '1924-09-21',
        firstName: 'George sr',
        gender: 'male',
        id: '181268',
        isFetus: false,
        isProband: false,
        lastName: 'Bush',
        ramq: 'GBUS987654321',
        relationCode: 'FTH',
      },
    ],
    idsOfParentUpdatingStatuses: [],
    patient: {
      original: {
        active: true,
        birthDate: '1924-09-21',
        extension: [
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
            valueBoolean: false,
          },
          { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus', valueBoolean: false },
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
            valueReference: { reference: 'Group/181285' },
          },
        ],
        gender: 'male',
        generalPractitioner: [
          { reference: 'PractitionerRole/PROLE-b0a42caf-c3fc-4df3-a1ff-37013f027a8d' },
        ],
        id: '181268',
        identifier: [
          {
            assigner: { reference: 'Organization/CHUM' },
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
            value: 'CHUM2CR',
          },
          {
            type: {
              coding: [
                {
                  code: 'JHN',
                  display: 'Jurisdictional health number (Canada)',
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                },
              ],
              text: 'Numéro du dossier médical',
            },
            value: 'GBUS987654321',
          },
        ],
        managingOrganization: { reference: 'Organization/CHUM' },
        meta: {
          lastUpdated: '2021-09-21T19:19:49.534+00:00',
          profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
          source: '#c0b4df7e65ade731',
          versionId: '5',
        },
        name: [{ family: 'Bush', given: ['George sr'] }],
        resourceType: 'Patient',
      },
      parsed: {
        birthDate: '1924-09-21',
        bloodRelationship: 'N/A',
        ethnicity: 'N/A',
        familyId: '181285',
        familyType: 'person',
        firstName: 'George sr',
        gender: 'male',
        id: '181268',
        isFetus: false,
        lastName: 'Bush',
        mrn: [{ hospital: 'CHUM', number: 'CHUM2CR' }],
        organization: "Centre hospitalier de l'Université de Montréal",
        proband: 'Parent',
        ramq: 'GBUS987654321',
        status: 'active',
      },
    },
  },
};
