import React from 'react';
import { render, screen } from '@testing-library/react';

import AppTest from '../../AppTest';
import FamilyTab from '../../components/screens/Patient/components/FamilyTab';

const patientSubState = {
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

describe('Family', () => {
  test('should display a table with all family members', async () => {
    render(
      <AppTest additionalStateInfo={{ ...patientSubState }}>
        <FamilyTab />
      </AppTest>,
    );

    const nOfHeaderRow = 1;
    const nOfFamilyMembers = patientSubState.patient.family.length;
    const totalNOfRow = nOfHeaderRow + nOfFamilyMembers;
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(totalNOfRow);
  });
});
