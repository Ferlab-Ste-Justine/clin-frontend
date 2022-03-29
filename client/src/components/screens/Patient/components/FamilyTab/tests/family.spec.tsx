import React from 'react';
import { render, screen, within } from '@testing-library/react';
import AppTest from 'AppTest';

import FamilyTab from '../index';

import { patientNotProbandSubState, patientProbandSubState } from './mockData';

describe('Family', () => {

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (subState: Record<string, unknown>) =>
    render(
      <AppTest additionalStateInfo={{ ...subState }}>
        <FamilyTab />
      </AppTest>,
    );

  test('should display a table with all family members', async () => {
    renderComponent(patientProbandSubState);

    const nOfHeaderRow = 1;
    const nOfFamilyMembers = patientProbandSubState.patient.family.length;
    const totalNOfRow = nOfHeaderRow + nOfFamilyMembers;
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(totalNOfRow);
  });

  test('should display a table with an "Actions" column when patient is proband', async () => {
    renderComponent(patientProbandSubState);
    const actionsColumnHeader = screen.getByRole('columnheader', { name: 'Actions' });
    expect(actionsColumnHeader).toBeDefined();
  });

  test('should display a table without an "Actions" column when patient is not proband', async () => {
    renderComponent(patientNotProbandSubState);
    const nOfExpectedColumnsWhenNotProband = 6;
    const allColumnHeaders = screen.getAllByRole('columnheader');
    expect(allColumnHeaders).toHaveLength(nOfExpectedColumnsWhenNotProband);
    allColumnHeaders.forEach((header) => {
      const { queryByText } = within(header);
      expect(queryByText('Actions')).toBeNull();
    });
  });
});
