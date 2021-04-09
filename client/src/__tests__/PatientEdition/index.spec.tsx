import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppTest from '../../AppTest';
import PatientScreen from '../../components/screens/Patient';
import { BASIC_PATIENT_NO_PRESCRIPTION } from './mocks';

describe('PatientEdition', () => {
  test('should be prefilled', async () => {
    render(
      <AppTest additionalStateInfo={BASIC_PATIENT_NO_PRESCRIPTION}>
        <PatientScreen />
      </AppTest>,
    );

    userEvent.click(screen.getByText(/modifier/i), {});
    expect(screen.getByLabelText('RAMQ')).toHaveValue('SMIM 2001 0199');
    expect(screen.getByLabelText('RAMQ (confirmation)')).toHaveValue('SMIM 2001 0199');
    expect(screen.getByLabelText('RAMQ')).toBeDisabled();
    expect(screen.getByLabelText('RAMQ (confirmation)')).toBeDisabled();
    expect(screen.getByLabelText('Nom de famille')).toHaveValue('Smith');
    expect(screen.getByLabelText('Prénom')).toHaveValue('Morty');
    expect(screen.getAllByText(/masculin/i)[1].previousSibling).toHaveClass('ant-radio-button-checked');
    expect(screen.getByLabelText('Date de naissance')).toHaveValue('2020-01-01');
    expect(screen.getAllByText('fp2020032901 | CHUSJ')[1]).toBeDefined();
  });

  describe('can edit a patient', () => {
    test('with valid data', async () => {
      render(
        <AppTest additionalStateInfo={BASIC_PATIENT_NO_PRESCRIPTION}>
          <PatientScreen />
        </AppTest>,
      );

      userEvent.click(screen.getByText(/modifier/i), {});
      console.log('#debug ', screen.getByRole('dialog').outerHTML); // TODO @francisprovost
    });
  });
});
