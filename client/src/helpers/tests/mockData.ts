export const patient207347 = {
  original: {
    active: true,
    birthDate: '1945-03-03',
    extension: [
      { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband', valueBoolean: true },
      { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus', valueBoolean: false },
      {
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
        valueReference: { reference: 'Group/207348' },
      },
      {
        extension: [
          {
            url: 'subject',
            valueReference: {
              reference: 'Patient/207339',
            },
          },
          {
            url: 'relation',
            valueCodeableConcept: {
              coding: [
                {
                  code: 'MTH',
                  system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
                },
              ],
            },
          },
        ],
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
      },
      {
        extension: [
          {
            url: 'subject',
            valueReference: {
              reference: 'Patient/207331',
            },
          },
          {
            url: 'relation',
            valueCodeableConcept: {
              coding: [
                {
                  code: 'FTH',
                  system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
                },
              ],
            },
          },
        ],
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
      },
    ],
    gender: 'male',
    generalPractitioner: [
      { reference: 'PractitionerRole/PROLE-b0a42caf-c3fc-4df3-a1ff-37013f027a8d' },
    ],
    id: '207347',
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
        value: 'UNENFANT1234',
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
        value: 'UENF45030313',
      },
    ],
    managingOrganization: { reference: 'Organization/CHUM' },
    meta: {
      lastUpdated: '2021-10-19T15:57:43.051+00:00',
      profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
      source: '#8399c317109cc29d',
      versionId: '4',
    },
    name: [{ family: 'Enfant', given: ['Un'] }],
    resourceType: 'Patient',
    text: {
      div: '<div xmlns="http://www.w3.org/1999/xhtml"><div class="hapiHeaderText">Un <b>ENFANT </b></div><table class="hapiPropertyTable"><tbody><tr><td>Identifier</td><td>UNENFANT1234</td></tr><tr><td>Date of birth</td><td><span>03 March 1945</span></td></tr></tbody></table></div>',
      status: 'generated',
    },
  },
  parsed: {
    birthDate: '1945-03-03',
    bloodRelationship: 'N/A',
    ethnicity: 'N/A',
    familyId: '207348',
    familyRelation: '207331',
    familyType: 'person',
    firstName: 'Un',
    gender: 'male',
    id: '207347',
    isFetus: false,
    lastName: 'Enfant',
    mrn: [{ hospital: 'CHUM', number: 'UNENFANT1234' }],
    organization: "Centre hospitalier de l'Université de Montréal",
    proband: 'Proband',
    ramq: 'UENF45030313',
    status: 'active',
  },
};
