import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import AppTest from '../../AppTest';
import PatientSubmission from '../../components/screens/PatientSubmission';
import { mockRptToken } from '../mocks';

function buildHPORequest() {
  return rest.get(
    'https://hpo.qa.clin.ferlab.bio/hpo/descendants',
    (req, res, ctx) => res(ctx.status(200), ctx.json({
      timestamp: 1623252338496,
      message: 'Ok',
      data: {
        total: 1,
        hits: [
          {
            _index: 'hpo',
            _type: '_doc',
            _id: '-ID',
            _score: 9.455486,
            _source: {
              id: 'HP:0012373',
              name: 'Abnormal eye physiology',
              parents: [{ id: 'HP:0000478', name: 'Abnormality of the eye' }],
              ancestors: [
                { id: 'HP:0000478', name: 'Abnormality of the eye' },
                { id: 'HP:0000118', name: 'Phenotypic abnormality' },
                { id: 'HP:0000001', name: 'All' },
              ],
            },
          },
        ],
      },
    })),
  );
}

describe('PrescriptionCreation', () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
  describe('Error Alert Save Prescription Button', () => {
    test('Withous Mrn and hypothesis', async () => {
      mockRptToken();

      server.use(buildHPORequest());
      render(
        <AppTest>
          <PatientSubmission />
        </AppTest>,
      );

      const familyHealth = screen.getByTestId('familyHealth');
      act(() => userEvent.click(familyHealth, {}));

      const cgh = screen.getByTestId('cgh');
      act(() => userEvent.click(cgh, {}));

      const clinicalSignRoot = screen.getByText('Abnormality of the eye').parentElement?.previousSibling;
      act(() => userEvent.click(clinicalSignRoot, {}));

      await waitFor(() => screen.getByText('Abnormal eye physiology'));

      const clinicalSign = screen.getByText('Abnormal eye physiology').parentElement?.previousSibling;
      act(() => userEvent.click(clinicalSign, {}));

      const clincalInterpretation = screen.getByPlaceholderText('Interprétation');
      act(() => userEvent.selectOptions(clincalInterpretation, ['POS']));

      act(() => userEvent.click(screen.getByText(/Suivant/i).closest('button'), {}));

      await waitFor(() => screen.getByTestId('alert'));
      expect(alert).toBeDefined();
    });

    test('Without cgh and familyHealth', async () => {
      mockRptToken();

      server.use(buildHPORequest());
      render(
        <AppTest>
          <PatientSubmission />
        </AppTest>,
      );

      const mrnOptions = screen.getByTestId('mrn-organization-submission');
      act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

      const prescriptionTestLabel = screen.getByText("Prédisposition aux cancers chez l'adulte");
      act(() => userEvent.click(prescriptionTestLabel, {}));

      const clinicalSignRoot = screen.getByText('Abnormality of the eye').parentElement?.previousSibling;
      act(() => userEvent.click(clinicalSignRoot, {}));

      await waitFor(() => screen.getByText('Abnormal eye physiology'));

      const clinicalSign = screen.getByText('Abnormal eye physiology').parentElement?.previousSibling;
      act(() => userEvent.click(clinicalSign, {}));

      const clincalInterpretation = screen.getByPlaceholderText('Interprétation');
      act(() => userEvent.selectOptions(clincalInterpretation, ['POS']));

      const hypothesisTextArea = screen.getByPlaceholderText('Ajouter une hypothèse...');
      act(() => userEvent.type(hypothesisTextArea, 'Hypothèse de la prescription.'));

      act(() => userEvent.click(screen.getByText(/Suivant/i).closest('button'), {}));

      await waitFor(() => screen.getByTestId('alert'));
      expect(alert).toBeDefined();
    });

    test('Whitout Hpo', async () => {
      mockRptToken();

      server.use(buildHPORequest());
      render(
        <AppTest>
          <PatientSubmission />
        </AppTest>,
      );

      const mrnOptions = screen.getByTestId('mrn-organization-submission');
      act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

      const prescriptionTestLabel = screen.getByText("Prédisposition aux cancers chez l'adulte");
      act(() => userEvent.click(prescriptionTestLabel, {}));

      const familyHealth = screen.getByTestId('familyHealth');
      act(() => userEvent.click(familyHealth, {}));

      const cgh = screen.getByTestId('cgh');
      act(() => userEvent.click(cgh, {}));

      const hypothesisTextArea = screen.getByPlaceholderText('Ajouter une hypothèse...');
      act(() => userEvent.type(hypothesisTextArea, 'Hypothèse de la prescription.'));

      act(() => userEvent.click(screen.getByText(/Suivant/i).closest('button'), {}));

      await waitFor(() => screen.getByTestId('alert'));
      expect(alert).toBeDefined();
    });
  });

  test('Go to next page', async () => {
    mockRptToken();

    server.use(buildHPORequest());
    render(
      <AppTest>
        <PatientSubmission />
      </AppTest>,
    );

    const mrnOptions = screen.getByTestId('mrn-organization-submission');
    act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

    const prescriptionTestLabel = screen.getByText("Prédisposition aux cancers chez l'adulte");
    act(() => userEvent.click(prescriptionTestLabel, {}));

    const familyHealth = screen.getByTestId('familyHealth');
    act(() => userEvent.click(familyHealth, {}));

    const cgh = screen.getByTestId('cgh');
    act(() => userEvent.click(cgh, {}));

    const clinicalSignRoot = screen.getByText('Abnormality of the eye').parentElement?.previousSibling;
    act(() => userEvent.click(clinicalSignRoot, {}));

    await waitFor(() => screen.getByText('Abnormal eye physiology'));

    const clinicalSign = screen.getByText('Abnormal eye physiology').parentElement?.previousSibling;
    act(() => userEvent.click(clinicalSign, {}));

    const clincalInterpretation = screen.getByPlaceholderText('Interprétation');
    act(() => userEvent.selectOptions(clincalInterpretation, ['POS']));

    const hypothesisTextArea = screen.getByPlaceholderText('Ajouter une hypothèse...');
    act(() => userEvent.type(hypothesisTextArea, 'Hypothèse de la prescription.'));

    act(() => userEvent.click(screen.getByText(/Suivant/i).closest('button'), {}));

    await waitFor(() => screen.getByText('Médecins prescripteurs'));
    expect(screen.getByText('Médecins prescripteurs')).toBeDefined();
  });
});
