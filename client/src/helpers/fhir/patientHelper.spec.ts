import moment from 'moment';

import {
  getDetailsFromRamq,
  hasAtLeastOneFetusChild,
  makeExtensionProband,
  RamqDetails,
  replaceExtensionFamilyId,
} from './patientHelper';
import { ResourceType } from './types';

describe('Helper: PatientHelper', () => {
  describe(`Function: ${getDetailsFromRamq.name}`, () => {
    test('should return null from invalid ramq', () => {
      expect(getDetailsFromRamq('')).toBeNull();
      expect(getDetailsFromRamq('toto')).toBeNull();
      expect(getDetailsFromRamq('SMIM')).toBeNull();
      expect(getDetailsFromRamq('1234567890')).toBeNull();
      expect(getDetailsFromRamq('20200101SMIM')).toBeNull();
      expect(getDetailsFromRamq('SMIM20200101')).toBeNull();
      expect(getDetailsFromRamq('SMIM20990101')).toBeNull();
    });

    test('should return valid RamqDetails from valid ramq', () => {
      expect(getDetailsFromRamq('SMIM20010101')).toEqual({
        birthDate: moment('2020-01-01').toDate(),
        sex: 'male',
        startFirstname: 'M',
        startLastname: 'Smi',
      } as RamqDetails);

      expect(getDetailsFromRamq('SMIS19512301')).toEqual({
        birthDate: moment('2019-01-23').toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
    });

    test('should handle older dates', () => {
      expect(getDetailsFromRamq('SMIS75512301')).toEqual({
        birthDate: moment('1975-01-23').toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
      expect(getDetailsFromRamq('SMIS60512301')).toEqual({
        birthDate: moment('1960-01-23').toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
    });

    test('should should handle 99 years old', () => {
      const nextYear = moment().add(1, 'year');
      const expectedYear = nextYear.subtract(100, 'years');
      expect(getDetailsFromRamq(`SMIS${nextYear.format('YY')}512301`)).toEqual({
        birthDate: moment(`${expectedYear.format('YYYY')}-01-23`).toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
    });

    test('should handle 2001', () => {
      expect(getDetailsFromRamq('SMIS01512301')).toEqual({
        birthDate: moment('2001-01-23').toDate(),
        sex: 'female',
        startFirstname: 'S',
        startLastname: 'Smi',
      } as RamqDetails);
    });
  });
  describe(`Function: ${makeExtensionProband.name}`, () => {
    test('should make an extension positively proband', () => {
      const originalExtensions = [
        { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband', valueBoolean: false },
      ];
      const expectedExtensions = [
        { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband', valueBoolean: true },
      ];

      const updatedExtensionsToIsProband = makeExtensionProband(originalExtensions);
      expect(updatedExtensionsToIsProband).toEqual(expectedExtensions);
      expect(Object.is(updatedExtensionsToIsProband, originalExtensions)).toBeFalsy();
    });
  });
  describe(`Function: ${replaceExtensionFamilyId.name}`, () => {
    test('should replace the old family id in the extension with a new family id', () => {
      const originalExtensions = [
        {
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
          valueReference: { reference: 'Group/1' },
        },
      ];
      const expectedExtensions = [
        {
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
          valueReference: { reference: 'Group/2' },
        },
      ];

      const replacedExtension = replaceExtensionFamilyId(originalExtensions, '1', '2');
      expect(replacedExtension).toEqual(expectedExtensions);
      expect(Object.is(replacedExtension, originalExtensions)).toBeFalsy();
    });
  });
  describe(`Function: ${hasAtLeastOneFetusChild.name}`, () => {
    test('should detect if patient has a child aka mother of an existing fetus', () => {
      const partialPatientWithFetus = {
        active: true,
        birthDate: '1980-12-01',
        extension: [
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
            valueBoolean: false,
          },
          { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus', valueBoolean: false },
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
            valueReference: { reference: 'Group/240422' },
          },
          {
            extension: [
              { url: 'subject', valueReference: { reference: 'Patient/240428' } },
              {
                url: 'relation',
                valueCodeableConcept: {
                  coding: [
                    {
                      code: 'CHILD',
                      display: 'child',
                      system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
                    },
                  ],
                },
              },
            ],
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
          },
        ],
        gender: 'female',
        generalPractitioner: [
          { reference: 'PractitionerRole/PROLE-d1c92d05-657b-4b1c-9b7b-56c81988287a' },
        ],
        id: '240421',
        identifier: [
          {
            assigner: { reference: 'Organization/CHUSJ' },
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
            value: 'feetusiadoss',
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
            value: 'FETU12548512',
          },
        ],
        managingOrganization: { reference: 'Organization/CHUSJ' },
        meta: {
          lastUpdated: '2021-11-10T16:58:22.828+00:00',
          profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
          source: '#7dfb3f61614c357c',
          versionId: '2',
        },
        name: [{ family: 'Feetusia', given: ['Bertha'] }],
        resourceType: 'Patient' as ResourceType,
      };
      expect(hasAtLeastOneFetusChild(partialPatientWithFetus)).toEqual(true);
    });
    test('should return false when not detecting a related fetus in the patient data', () => {
      const patientFemaleWithoutFetus = {
        active: true,
        birthDate: '2012-04-12',
        extension: [
          { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband', valueBoolean: true },
          { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus', valueBoolean: false },
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
            valueReference: { reference: 'Group/239868' },
          },
        ],
        gender: 'female',
        generalPractitioner: [
          { reference: 'PractitionerRole/PROLE-b0a42caf-c3fc-4df3-a1ff-37013f027a8d' },
        ],
        id: '239772',
        identifier: [
          {
            assigner: { reference: 'Organization/CHUSJ' },
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
            value: 'hihou1234',
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
            value: 'HHOU12541212',
          },
        ],
        managingOrganization: { reference: 'Organization/CHUSJ' },
        meta: {
          lastUpdated: '2021-11-09T21:30:05.929+00:00',
          profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
          source: '#deb46afe96a20c86',
          versionId: '3',
        },
        name: [{ family: 'Hou', given: ['Hi'] }],
        resourceType: 'Patient' as ResourceType,
      };
      expect(hasAtLeastOneFetusChild(patientFemaleWithoutFetus)).toEqual(false);
      const patientMale = {
        active: true,
        birthDate: '2021-09-02',
        extension: [
          { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband', valueBoolean: true },
          { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus', valueBoolean: false },
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
            valueReference: { reference: 'Group/239269' },
          },
          {
            extension: [
              { url: 'subject', valueReference: { reference: 'Patient/239276' } },
              {
                url: 'relation',
                valueCodeableConcept: {
                  coding: [
                    { code: 'FTH', system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember' },
                  ],
                },
              },
            ],
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
          },
        ],
        gender: 'male',
        generalPractitioner: [
          { reference: 'PractitionerRole/PROLE-d1c92d05-657b-4b1c-9b7b-56c81988287a' },
        ],
        id: '239268',
        identifier: [
          {
            assigner: { reference: 'Organization/CHUSJ' },
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
            value: 'mrnabcded',
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
            value: 'FAMI20028795',
          },
        ],
        managingOrganization: { reference: 'Organization/CHUSJ' },
        meta: {
          lastUpdated: '2021-11-09T19:37:23.439+00:00',
          profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
          versionId: '4',
          source: '#e3eb9e30288f4b2a',
        },
        name: [{ family: 'Familyid', given: ['Paul'] }],
        resourceType: 'Patient' as ResourceType,
      };
      expect(hasAtLeastOneFetusChild(patientMale)).toEqual(false);
    });
  });
});
