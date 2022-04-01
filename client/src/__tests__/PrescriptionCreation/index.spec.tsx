import React from 'react';
import { act } from 'react-dom/test-utils';
import {
  queryByTestId,
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import AppTest from '../../AppTest';
import PatientSubmission from '../../components/screens/PatientSubmission';
import { mockRptToken } from '../mocks';
import * as mock from '../mocks/mockData'

const buildHPORequest = () => rest.get(
  'https://hpo.qa.cqgc.hsj.rtss.qc.ca/hpo/descendants',
  (req, res, ctx) => res(ctx.status(200), ctx.json(mock.HPORequest)),
);

const buildServiceRequestCodeRequest = () => rest.get(
  'https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/CodeSystem/service-request-code',
  (req, res, ctx) => res(ctx.status(200), ctx.json(mock.ServiceRequestCodeRequest)),
);
describe('PrescriptionCreation', () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    server.resetHandlers();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    server.close();
  });

  describe('Should not be able to create a prescription', () => {
    test('without MRN', async () => {
      mockRptToken();

      server.use(buildHPORequest());
      server.use(buildServiceRequestCodeRequest());
      render(
        <AppTest>
          <PatientSubmission />
        </AppTest>,
      );
      
      await waitFor(() => screen.getByTestId('MMG'));
      const prescriptionTestLabel = screen.getByTestId('MMG');
      act(() => userEvent.click(prescriptionTestLabel, {}));

      act(() => userEvent.click(screen.getByTestId('SubmitButton'), {}));

      await waitFor(() => screen.getByTestId('alert'));
      expect(alert).toBeDefined();
    });

    test('without Analyse', async () => {
      mockRptToken();

      server.use(buildHPORequest());
      server.use(buildServiceRequestCodeRequest());
      render(
        <AppTest>
          <PatientSubmission />
        </AppTest>,
      );

      const mrnOptions = screen.getByTestId('mrn-organization-submission');
      act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

      act(() => userEvent.click(screen.getByTestId('SubmitButton'), {}));

      await waitFor(() => screen.getByTestId('alert'));
      expect(alert).toBeDefined();
    });

  describe('Should be able to create a prescription', () => {
    test('with required field only', async () => {
      mockRptToken();

      server.use(buildHPORequest());
      server.use(buildServiceRequestCodeRequest());
      render(
        <AppTest>
          <PatientSubmission />
        </AppTest>,
      );

      const mrnOptions = screen.getByTestId('mrn-organization-submission');
      act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

      await waitFor(() => screen.getByTestId('MMG'));
      const prescriptionTestLabel = screen.getByTestId('MMG');
      act(() => userEvent.click(prescriptionTestLabel, {}));

      act(() => userEvent.click(screen.getByTestId('SubmitButton'), {}));

      await waitFor(() => screen.getByTestId('submissionModal'));

      await waitFor(() => expect(queryByTestId(screen.getByTestId('submissionModal'), 'prescribingDoctor-placeholder')).toBeNull());
      });
    });

    test('with all fields', async () => {
      mockRptToken();

      server.use(buildHPORequest());
      server.use(buildServiceRequestCodeRequest());
      render(
        <AppTest>
          <PatientSubmission />
        </AppTest>,
      );

      const mrnOptions = screen.getByTestId('mrn-organization-submission');
      act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

      await waitFor(() => screen.getByTestId('MMG'));
      const prescriptionTestLabel = screen.getByTestId('MMG');
      act(() => userEvent.click(prescriptionTestLabel, {}));

      const cgh = screen.getByTestId('cgh');
      act(() => userEvent.click(cgh, {}));
      await waitFor(() => screen);

      const familyHealth = screen.getByTestId('familyHealth');
      act(() => userEvent.click(familyHealth, {}));

      const clinicalSignRoot = screen.getByText('Abnormal eye physiology (HP:0012373)').parentElement?.previousSibling as Element;
      act(() => userEvent.click(clinicalSignRoot, {}));

      const clincalInterpretation = screen.getByTestId('InterpretationDropdown');
      act(() => userEvent.selectOptions(clincalInterpretation, ['POS']));

      const hypothesisTextArea = screen.getByTestId('hypothesis-placeholder');
      act(() => userEvent.type(hypothesisTextArea, 'Hypothèse de la prescription.'));

      act(() => userEvent.click(screen.getByTestId('SubmitButton'), {}));

      await waitFor(() => screen.getByTestId('submissionModal'));

      await waitFor(() => expect(queryByTestId(screen.getByTestId('submissionModal'), 'prescribingDoctor-placeholder')).toBeNull());
    });
  });
});
