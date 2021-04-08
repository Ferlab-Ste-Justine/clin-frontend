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
import { ResponseBuilder } from '../utils/Utils';

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

  test('Enable/Disable Save Prescription Button', async () => {
    render(
      <AppTest>
        <PatientSubmission />
      </AppTest>,
    );

    expect(screen.getByText(/compléter plus tard/i).closest('button')).toBeDisabled();

    const mrnOptions = screen.getByPlaceholderText(/Sélectionner un dossier/i);
    act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

    const prescriptionTestLabel = screen.getByText("Prédisposition aux cancers chez l'adulte");
    act(() => userEvent.click(prescriptionTestLabel, {}));

    const hypothesisTextArea = screen.getByPlaceholderText('Ajouter une hypothèse...');
    act(() => userEvent.type(hypothesisTextArea, 'Hypothèse de la prescription.'));

    const clinicalSign = screen.getByText('Abnormality of the eye').parentElement?.previousSibling;
    act(() => userEvent.click(clinicalSign, {}));

    const clincalInterpretation = screen.getByPlaceholderText('Interprétation');
    act(() => userEvent.selectOptions(clincalInterpretation, ['POS']));

    expect(screen.getByText(/compléter plus tard/i).closest('button')).toBeEnabled();
  });

  test('Enable/Disable Next Prescription Button', async () => {
    render(
      <AppTest>
        <PatientSubmission />
      </AppTest>,
    );

    expect(screen.getByText(/Suivant/i).closest('button')).toBeDisabled();

    const mrnOptions = screen.getByPlaceholderText(/Sélectionner un dossier/i);
    act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

    const prescriptionTestLabel = screen.getByText("Prédisposition aux cancers chez l'adulte");
    act(() => userEvent.click(prescriptionTestLabel, {}));

    const hypothesisTextArea = screen.getByPlaceholderText('Ajouter une hypothèse...');
    act(() => userEvent.type(hypothesisTextArea, 'Hypothèse de la prescription.'));

    const clinicalSign = screen.getByText('Abnormality of the eye').parentElement?.previousSibling;
    act(() => userEvent.click(clinicalSign, {}));

    const clincalInterpretation = screen.getByPlaceholderText('Interprétation');
    act(() => userEvent.selectOptions(clincalInterpretation, ['POS']));

    expect(screen.getByText(/Suivant/i).closest('button')).toBeEnabled();
  });

  test('Prescription (2nd Page): Disabled Soumettre button', async () => {
    render(
      <AppTest>
        <PatientSubmission />
      </AppTest>,
    );

    expect(screen.getByText(/Suivant/i).closest('button')).toBeDisabled();

    const mrnOptions = screen.getByPlaceholderText(/Sélectionner un dossier/i);
    act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

    const prescriptionTestLabel = screen.getByText("Prédisposition aux cancers chez l'adulte");
    act(() => userEvent.click(prescriptionTestLabel, {}));

    const hypothesisTextArea = screen.getByPlaceholderText('Ajouter une hypothèse...');
    act(() => userEvent.type(hypothesisTextArea, 'Hypothèse de la prescription.'));

    const clinicalSign = screen.getByText('Abnormality of the eye').parentElement?.previousSibling;
    act(() => userEvent.click(clinicalSign, {}));

    const clincalInterpretation = screen.getByPlaceholderText('Interprétation');
    act(() => userEvent.selectOptions(clincalInterpretation, ['POS']));

    expect(screen.getByText(/Suivant/i).closest('button')).toBeEnabled();

    act(() => userEvent.click(screen.getByText(/Suivant/i).closest('button'), {}));
    await waitFor(() => screen.getByText('Clause pour la recherche'));

    expect(screen.getByText(/Soumettre/i).closest('button')).toBeDisabled();
  });

  test('Prescription (2nd Page): Practitioner Auto complete', async () => {
    const response = new ResponseBuilder()
      .withPractitioner({
        firstName: 'FirstName',
        lastName: 'TestLastName',
        number: '0',
      }).build();

    server.use(
      rest.get('https://fhir.qa.clin.ferlab.bio/fhir/Practitioner?', (req, res, ctx) => res(
        ctx.status(200),
        ctx.json(response),
      )),
    );

    render(
      <AppTest>
        <PatientSubmission />
      </AppTest>,
    );

    expect(screen.getByText(/Suivant/i).closest('button')).toBeDisabled();

    const mrnOptions = screen.getByPlaceholderText(/Sélectionner un dossier/i);
    act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

    const prescriptionTestLabel = screen.getByText("Prédisposition aux cancers chez l'adulte");
    act(() => userEvent.click(prescriptionTestLabel, {}));

    const hypothesisTextArea = screen.getByPlaceholderText('Ajouter une hypothèse...');
    act(() => userEvent.type(hypothesisTextArea, 'Hypothèse de la prescription.'));

    const clinicalSign = screen.getByText('Abnormality of the eye').parentElement?.previousSibling;
    act(() => userEvent.click(clinicalSign, {}));

    const clincalInterpretation = screen.getByPlaceholderText('Interprétation');
    act(() => userEvent.selectOptions(clincalInterpretation, ['POS']));

    expect(screen.getByText(/Suivant/i).closest('button')).toBeEnabled();

    act(() => userEvent.click(screen.getByText(/Suivant/i).closest('button'), {}));
    await waitFor(() => screen.getByText('Clause pour la recherche'));

    const searchPractitionerInput = screen.getByText('Recherche par nom ou licence...');
    act(() => userEvent.type(searchPractitionerInput, 'ABCD'));

    await new Promise((r) => setTimeout(r, 2000));
    const practitionerSelection = (await screen.findByText('TESTLASTNAME'));

    expect(practitionerSelection).toBeDefined();
  });

  test('Prescription (2nd Page): Enabled Soumettre button', async () => {
    const response = new ResponseBuilder()
      .withPractitioner({
        firstName: 'FirstName',
        lastName: 'TestLastName',
        number: '0',
      }).build();

    server.use(
      rest.get('https://fhir.qa.clin.ferlab.bio/fhir/Practitioner?', (req, res, ctx) => res(
        ctx.status(200),
        ctx.json(response),
      )),
    );

    render(
      <AppTest>
        <PatientSubmission />
      </AppTest>,
    );

    expect(screen.getByText(/Suivant/i).closest('button')).toBeDisabled();

    const mrnOptions = screen.getByPlaceholderText(/Sélectionner un dossier/i);
    act(() => userEvent.selectOptions(mrnOptions, 'MRN1 | CHUSJ'));

    const prescriptionTestLabel = screen.getByText("Prédisposition aux cancers chez l'adulte");
    act(() => userEvent.click(prescriptionTestLabel, {}));

    const hypothesisTextArea = screen.getByPlaceholderText('Ajouter une hypothèse...');
    act(() => userEvent.type(hypothesisTextArea, 'Hypothèse de la prescription.'));

    const clinicalSign = screen.getByText('Abnormality of the eye').parentElement?.previousSibling;
    act(() => userEvent.click(clinicalSign, {}));

    const clincalInterpretation = screen.getByPlaceholderText('Interprétation');
    act(() => userEvent.selectOptions(clincalInterpretation, ['POS']));

    expect(screen.getByText(/Suivant/i).closest('button')).toBeEnabled();

    act(() => userEvent.click(screen.getByText(/Suivant/i).closest('button'), {}));
    await waitFor(() => screen.getByText('Clause pour la recherche'));

    expect(screen.getByText(/Soumettre/i).closest('button')).toBeDisabled();

    act(() => userEvent.click(screen.getByText('Clause pour la recherche'), {}));

    const searchPractitionerInput = screen.getByText('Recherche par nom ou licence...');
    act(() => userEvent.type(searchPractitionerInput, 'ABCD'));

    await new Promise((r) => setTimeout(r, 2000));
    const practitionerSelection = (await screen.findByText('TESTLASTNAME')).parentElement;
    userEvent.click(practitionerSelection, {});

    expect(screen.getByText(/Soumettre/i).closest('button')).toBeEnabled();
  }, 15000);
});
