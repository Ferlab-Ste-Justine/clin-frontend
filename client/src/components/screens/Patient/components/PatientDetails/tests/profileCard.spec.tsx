import React from 'react';
import { render, screen } from '@testing-library/react';
import AppTest from 'AppTest';

import ProfileCard from '../ProfileCard';

const patientSubState = {
  patient: {
    canEdit: true,
    currentActiveKey: 'family',
    family: [
      {
        birthDate: '1954-09-21',
        firstName: 'Michelle',
        gender: 'female',
        id: '181301',
        isFetus: false,
        isProband: true,
        lastName: 'Obama',
        ramq: 'MOBA12345678',
        relationCode: 'NMTHF',
      },
      {
        birthDate: '1954-09-21',
        firstName: 'Michelle',
        gender: 'female',
        id: '181318',
        isFetus: true,
        isProband: true,
        lastName: 'Obama',
        ramq: 'MOBA12345678',
        relationCode: 'CHILD',
      },
    ],
    observations: {},
    patient: {
      original: {
        active: true,
        birthDate: '1954-09-21',
        extension: [
          { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband', valueBoolean: true },
          { url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus', valueBoolean: true },
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
            valueReference: { reference: 'Group/181302' },
          },
          {
            extension: [
              { url: 'subject', valueReference: { reference: 'Patient/181301' } },
              {
                url: 'relation',
                valueCodeableConcept: {
                  coding: [
                    {
                      code: 'NMTHF',
                      display: 'natural mother of fetus',
                      system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
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
          { reference: 'PractitionerRole/PROLE-b0a42caf-c3fc-4df3-a1ff-37013f027a8d' },
        ],
        id: '181318',
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
            value: 'CHUM6CR',
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
            value: 'MOBA12345678',
          },
        ],
        managingOrganization: { reference: 'Organization/CHUM' },
        meta: {
          lastUpdated: '2021-09-21T18:35:06.511+00:00',
          profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
          source: '#2984944cee07f8fe',
          versionId: '1',
        },
        name: [{ family: 'Obama', given: ['Michelle'] }],
        resourceType: 'Patient',
      },
      parsed: {
        birthDate: '1954-09-21',
        bloodRelationship: 'N/A',
        ethnicity: 'N/A',
        familyId: '181302',
        familyRelation: '181301',
        familyType: 'person',
        firstName: 'Michelle',
        gender: 'female',
        id: '181318',
        isFetus: true,
        lastName: 'Obama',
        mrn: [{ hospital: 'CHUM', number: 'CHUM6CR' }],
        organization: "Centre hospitalier de l'Université de Montréal",
        proband: 'Proband',
        ramq: 'MOBA12345678',
        status: 'active',
      },
    },
  },
};

describe('Patient Profile Card', () => {
  test('should display 1 button linking to the mother of the fetus', async () => {
    render(
      <AppTest additionalStateInfo={{ ...patientSubState }}>
        <ProfileCard />
      </AppTest>,
    );

    expect(screen.getByText('OBAMA Michelle (mère)').closest('button')).toBeDefined();
  });
});
