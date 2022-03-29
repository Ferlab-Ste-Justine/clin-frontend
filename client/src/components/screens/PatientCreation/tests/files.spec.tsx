import React from 'react';
import {
  queryByText,
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import AppTest from 'AppTest';
import PatientCreation from '../../PatientCreation';
import { mockRptToken } from '__tests__/mocks';
import * as mock from './mockData';

describe('PatientCreation', () => {
  const server = setupServer();

  function setupValidPostmockResponse(isFetus = false) {
    const responseEntries = mock.ResponsePatient51006;

    if (isFetus) {
      responseEntries.push(mock.ResponsePatient51007);
    }

    server.use(
      rest.post('https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/', (req, res, ctx) => res(
        ctx.status(200),
        ctx.json({
          entry: responseEntries,
          id: 'f3d8da0f-da55-44fd-942a-6760543cec4b',
          link: [{
            relation: 'self',
            url: 'https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir',
          }],
          resourceType: 'Bundle',
          type: 'transaction-response',
        }),
      )),
    );
  }

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe('Should be able to create a patient', () => {
    test('with a new RAMQ', async () => {
      mockRptToken();
      server.use(
        rest.get('https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient', (req, res, ctx) => res(
          ctx.status(200),
          ctx.json(mock.ResponseBundleDABC01010101),
        )),
      );

      setupValidPostmockResponse();
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientCreation /></AppTest>);

      userEvent.click(screen.getByTestId('PatientCreationButton'), {});

      userEvent.type(screen.getByTestId('InputRAMQ'), 'DABC01010101');

      await waitFor(() => screen.getByTestId('InputLastName'));

      userEvent.type(screen.getByTestId('InputLastName'), 'Smith');
      userEvent.type(screen.getByTestId('InputFirstName'), 'Morty');

      expect(screen.getByTestId('DatePickerBirthday')).toHaveValue('2001-01-01');

      expect(screen.getByText(/masculin/i).previousSibling).toHaveClass('ant-radio-button-checked');
      expect(screen.getByTestId('DatePickerBirthday')).toHaveValue('2001-01-01');
      userEvent.type(screen.getByTestId('DatePickerBirthday'), '2020-01-01{enter}');

      userEvent.type(screen.getByTestId('mrn-file'), 'AB1234');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CHUSJ');

      expect(screen.getByText(/soumettre/i).closest('button')).toBeEnabled();
      userEvent.click(screen.getByText(/soumettre/i), {});

      await waitFor(() => screen.getByTestId('ModalCreating'));
      await waitFor(() => screen.getByTestId('ResultModalCreation'));
      expect(screen.getByText('SMITH Morty')).toBeDefined();
    });
  });

  describe('Should be able to create a foetus', () => {
    test("with a new mother's RAMQ", async () => {
      mockRptToken();
      server.use(
        rest.get('https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient', (req, res, ctx) => res(
          ctx.status(200),
          ctx.json(mock.ResponseBundle200),
        )),
      );

      setupValidPostmockResponse(true);
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientCreation /></AppTest>);

      userEvent.click(screen.getByTestId('PatientCreationButton'), {});

      userEvent.click(screen.getByText(/fœtus/i), {});

      expect(screen.getAllByText(/fœtus/i)[0].parentNode).toHaveClass('ant-radio-button-wrapper-checked');

      userEvent.type(screen.getByTestId('InputRAMQ'), 'DABC01010101');

      await waitFor(() => screen.getByTestId('InputLastName'));

      userEvent.type(screen.getByTestId('InputLastName'), 'Smith');
      userEvent.type(screen.getByTestId('InputFirstName'), 'Beth');

      userEvent.click(screen.getByText(/masculin/i), {});

      userEvent.type(screen.getByTestId('mrn-file'), 'AB1234');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CHUSJ');

      expect(screen.getByText(/soumettre/i).closest('button')).toBeEnabled();
      userEvent.click(screen.getByText(/soumettre/i), {});

      await waitFor(() => screen.getByTestId('ModalCreating'));

      await waitFor(() => screen.getByTestId('ResultModalCreation'));

      expect(screen.getByText('SMITH Beth (fœtus)')).toBeDefined();
    });

    test("with an existing mother's RAMQ", async () => {
      mockRptToken();
      const ramq = 'BETS00000001';

      server.use(
        rest.get('https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient', (req, res, ctx) => {
          let entry;

          if (req.url.href.includes(ramq)) {
            entry = mock.EntryPatient54382;
          }

          return res(
            ctx.status(200),
            ctx.json({
              entry,
              id: '2acbea67-8d49-477b-bbae-7acb18430780',
              link: [],
              meta: {
                lastUpdated: '2021-03-19T18:49:41.787+00:00',
              },
              resourceType: 'Bundle',
              total: 0,
              type: 'searchset',
            }),
          );
        }),
      );

      setupValidPostmockResponse(true);
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientCreation /></AppTest>);

      userEvent.click(screen.getByTestId('PatientCreationButton'), {});

      userEvent.click(screen.getByText(/fœtus/i), {});

      userEvent.type(screen.getByTestId('InputRAMQ'), ramq);

      await waitFor(() => screen.getByTestId('InputLastName'));

      expect(screen.getByTestId('InputLastName')).toBeDisabled();
      expect(screen.getByTestId('InputFirstName')).toBeDisabled();
      expect(screen.getByTestId('mrn-file')).toHaveValue('010000');
      expect(screen.getByTestId('mrn-organization')).toHaveValue('CUSM');

      userEvent.click(screen.getByText(/masculin/i), {});

      expect(screen.getByText(/soumettre/i).closest('button')).toBeEnabled();
      userEvent.click(screen.getByText(/soumettre/i), {});

      await waitFor(() => screen.getByTestId('ModalCreating'));

      await waitFor(() => screen.getByTestId('ResultModalCreation'));

      expect(screen.getByText('SMITH Beth (fœtus)')).toBeDefined();
    });
  });

  describe('Should not be able to create a patient', () => {
    test('with an existing RAMQ', async () => {
      mockRptToken();
      server.use(
        rest.get('https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient', (req, res, ctx) => res(
          ctx.status(200),
          ctx.json(mock.EntryPatient54383),
        )),
      );

      setupValidPostmockResponse();
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientCreation /></AppTest>);

      userEvent.click(screen.getByTestId('PatientCreationButton'), {});

      userEvent.type(screen.getByTestId('InputRAMQ'), 'BETS00000001');

      await waitFor(() => screen.getByText(/Nous avons trouvé une fiche avec les mêmes identifiants./i));
      expect(screen.getByText('SMITH Beth')).toBeDefined();
    });

    test('with an existing MRN', async () => {
      mockRptToken();
      server.use(
        rest.get('https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient', (req, res, ctx) => {
          let entry;
          if (req.url.href.includes('CUSM') && req.url.href.includes('010000')) {
            entry = mock.EntryPatient54382;
          }
          return res(
            ctx.status(200),
            ctx.json({
              entry,
              id: '2acbea67-8d49-477b-bbae-7acb18430780',
              link: [],
              meta: {
                lastUpdated: '2021-03-19T18:49:41.787+00:00',
              },
              resourceType: 'Bundle',
              total: 0,
              type: 'searchset',
            }),
          );
        }),
      );

      server.listen({ onUnhandledRequest: 'error' });
      server.printHandlers();

      render(<AppTest><PatientCreation /></AppTest>);

      userEvent.click(screen.getByTestId('PatientCreationButton'), {});

      userEvent.type(screen.getByTestId('InputRAMQ'), 'DABC01010101');

      await waitFor(() => screen.getByTestId('InputLastName'));

      userEvent.type(screen.getByTestId('InputLastName'), 'Smith');
      userEvent.type(screen.getByTestId('InputFirstName'), 'Morty');

      userEvent.click(screen.getByText(/masculin/i), {});
      userEvent.type(screen.getByTestId('DatePickerBirthday'), '2020-01-01{enter}');

      userEvent.type(screen.getByTestId('mrn-file'), '010000');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CUSM');

      expect(screen.getByText(/soumettre/i).closest('button')).toBeEnabled();
      userEvent.click(screen.getByText(/soumettre/i), {});

      await waitFor(() => screen.getAllByText(/Le numéro de dossier doit être non vide et unique pour cet hôpital./i));
    });
  });

  describe('Should show a modal', () => {
    test('when finding a patient with their RAMQ', async () => {
      mockRptToken();
      server.use(
        rest.get('https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient', (req, res, ctx) => res(
          ctx.status(200),
          ctx.json({
            entry: mock.EntryPatient54382,
            id: '2acbea67-8d49-477b-bbae-7acb18430780',
            link: [{
              relation: 'self',
              url: 'https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient?identifier=BETS00000001',
            }],
            meta: {
              lastUpdated: '2021-03-19T18:49:41.787+00:00',
            },
            resourceType: 'Bundle',
            total: 0,
            type: 'searchset',
          }),
        )),
      );

      setupValidPostmockResponse();
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientCreation /></AppTest>);

      userEvent.click(screen.getByTestId('PatientCreationButton'), {});

      userEvent.type(screen.getByTestId('InputRAMQ'), 'BETS00000001');

      await waitFor(() => screen.getByTestId('ResultModalExistingPatient'));
      expect(screen.getByText('SMITH Beth')).toBeDefined();

      userEvent.click(screen.getByTestId('CloseButton'), {});
      userEvent.click(screen.getByTestId('PatientCreationButton'), {});

      expect(screen.getByTestId('InputRAMQ')).toHaveValue('');
    });
  });

  describe('Should reset the form', () => {
    test('when changing the patient type', async () => {
      mockRptToken();
      server.use(
        rest.get('https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient', (req, res, ctx) => res(
          ctx.status(200),
          ctx.json(mock.ResponseBundleBETS00000001),
        )),
      );

      setupValidPostmockResponse();
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientCreation /></AppTest>);

      userEvent.click(screen.getByTestId('PatientCreationButton'), {});

      // Fill the form
      userEvent.type(screen.getByTestId('InputRAMQ'), 'BETS00000001');

      await waitFor(() => screen.getByTestId('InputLastName'));

      userEvent.type(screen.getByTestId('InputLastName'), 'Smith');
      userEvent.type(screen.getByTestId('InputFirstName'), 'Morty');

      userEvent.click(screen.getByText(/masculin/i), {});
      userEvent.type(screen.getByTestId('DatePickerBirthday'), '2020-01-01{enter}');

      userEvent.type(screen.getByTestId('mrn-file'), 'AB1234');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CHUSJ');

      userEvent.click(screen.getByText(/fœtus/i), {});

      expect(screen.getByTestId('InputRAMQ')).toHaveValue('');
      expect(queryByText(screen.getByRole('dialog'), 'Nom de famille')).not.toBeInTheDocument();
    });
  });

  describe('Fields validation', () => {
    test('MRN should only accept alpha numerical charactar', async () => {
      mockRptToken();
      server.use(
      rest.get('https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient', (req, res, ctx) => res(
        ctx.status(200),
        ctx.json(mock.ResponseBundleDABC01010101),
      )),
      );

      server.listen({ onUnhandledRequest: 'error' });

      render(<AppTest><PatientCreation /></AppTest>);
      userEvent.click(screen.getByTestId('PatientCreationButton'), {});

      userEvent.type(screen.getByTestId('InputRAMQ'), 'DABC01010101');

      await waitFor(() => screen.getByTestId('InputLastName'));

      userEvent.type(screen.getByTestId('InputLastName'), 'Smith');
      userEvent.type(screen.getByTestId('InputFirstName'), 'Morty');

      userEvent.click(screen.getByText(/masculin/i), {});
      userEvent.type(screen.getByTestId('DatePickerBirthday'), '2020-01-01{enter}');

        await waitFor(() => screen.getByTestId('InputLastName'));

        userEvent.type(screen.getByTestId('mrn-file'), 'abc-123()/é');
        expect(screen.getByTestId('mrn-file')).toHaveValue('abc123');
    });
  });
});
