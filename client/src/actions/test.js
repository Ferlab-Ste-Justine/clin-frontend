const request = {
  type: 'CREATE_PATIENT_REQUESTED',
  patient: {
    resourceType: 'Patient',
    meta: {
      profile: [
        'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient',
      ],
    },
    active: true,
    birthDate: '2020-12-28',
    extension: [
      {
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
        valueBoolean: true,
      },
      {
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
        valueReference: {
          reference: 'urn:uuid:2cf05b8c-3a76-4536-be68-fb4880664de2',
        },
      },
    ],
    gender: 'male',
    generalPractitioner: [
      {
        reference: 'PractitionerRole/PROLE-78a60801-cbab-4064-93c6-d85aeadc1edb',
      },
    ],
    identifier: [
      {
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
        value: '1324',
      },
    ],
    managingOrganization: {
      reference: 'Organization/CHUSJ',
    },
    name: [
      {
        family: 'Harvey',
        given: [
          'Specter',
        ],
      },
    ],
    id: 'urn:uuid:71ba7225-31ff-4a49-b144-85f848ce345e',
  },
  familyGroup: {
    id: 'urn:uuid:2cf05b8c-3a76-4536-be68-fb4880664de2',
    resourceType: 'Group',
    meta: {
      profile: [
        'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-family-group',
      ],
    },
    type: 'person',
    actual: true,
    member: [
      {
        entity: {
          reference: 'Patient/urn:uuid:71ba7225-31ff-4a49-b144-85f848ce345e',
        },
      },
    ],
  },

};
console.log(request);
