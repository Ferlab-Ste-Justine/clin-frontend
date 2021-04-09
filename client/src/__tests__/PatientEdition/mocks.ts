export const BASIC_PATIENT_NO_PRESCRIPTION = {
  patient: {
    patient: {
      original: {
        resourceType: 'Patient',
        id: '53523',
        meta: {
          versionId: '1',
          lastUpdated: '2021-03-29T20:41:26.110+00:00',
          source: '#a2a5f87e51c77160',
          profile: [
            'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient',
          ],
        },
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><div class="hapiHeaderText">Morty <b>SMITH </b></div><table class="hapiPropertyTable"><tbody><tr><td>Identifier</td><td>fp2020032901</td></tr><tr><td>Date of birth</td><td><span>01 January 2020</span></td></tr></tbody></table></div>',
        },
        extension: [
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
            valueBoolean: true,
          },
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus',
            valueBoolean: false,
          },
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
            valueReference: {
              reference: 'Group/53524',
            },
          },
        ],
        identifier: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical record number',
                },
              ],
              text: 'Numéro du dossier médical',
            },
            value: 'fp2020032901',
            assigner: {
              reference: 'Organization/CHUSJ',
            },
          },
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'JHN',
                  display: 'Jurisdictional health number (Canada)',
                },
              ],
              text: 'Numéro du dossier médical',
            },
            value: 'SMIM20010199',
          },
        ],
        active: true,
        name: [
          {
            family: 'Smith',
            given: [
              'Morty',
            ],
          },
        ],
        gender: 'male',
        birthDate: '2020-01-01',
        generalPractitioner: [
          {
            reference: 'PractitionerRole/PROLE-f5d6b2c6-957b-4b4a-b9be-df5c1b4aa9e4',
          },
        ],
        managingOrganization: {
          reference: 'Organization/CHUSJ',
        },
      },
      parsed: {
        id: '53523',
        status: 'active',
        lastName: 'Smith',
        firstName: 'Morty',
        ramq: '--',
        mrn: [
          {
            number: 'fp2020032901',
            hospital: 'CHUSJ',
          },
        ],
        organization: 'CHUSJ',
        gender: 'male',
        birthDate: '2020-01-01',
        ethnicity: 'N/A',
        bloodRelationship: 'N/A',
        familyId: '53524',
        familyType: 'person',
        proband: 'Proband',
        isFetus: false,
      },
    },
    observations: {},
    canEdit: true,
  },
};
