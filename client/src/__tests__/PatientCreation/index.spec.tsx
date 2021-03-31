import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import PatientSearchScreen from '../../components/screens/PatientSearch';

import AppTest from '../../AppTest';

describe('PatientCreation', () => {
  const server = setupServer();
  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Should be able to create a patient', () => {
    test('as a patient with RAMQ', async () => {
      server.use(
        rest.get('https://fhir.qa.clin.ferlab.bio/fhir/Patient', (req, res, ctx) => res(
          ctx.status(200),
          ctx.json({
            resourceType: 'Bundle',
            id: '2acbea67-8d49-477b-bbae-7acb18430780',
            meta: {
              lastUpdated: '2021-03-19T18:49:41.787+00:00',
            },
            type: 'searchset',
            total: 0,
            link: [{
              relation: 'self',
              url: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient?identifier=DABC01010101',
            }],
          }),
        )),
      );

      server.use(
        rest.post('https://fhir.qa.clin.ferlab.bio/fhir/', (req, res, ctx) => res(
          ctx.status(200),
          ctx.json({
            resourceType: 'Bundle',
            id: 'f3d8da0f-da55-44fd-942a-6760543cec4b',
            type: 'transaction-response',
            link: [{
              relation: 'self',
              url: 'https://fhir.qa.clin.ferlab.bio/fhir',
            }],
            entry: [{
              response: {
                status: '201 Created',
                location: 'Patient/51006/_history/1',
                etag: '1',
                lastModified: '2021-03-26T19:43:01.238+00:00',
              },
            }, {
              response: {
                status: '201 Created',
                location: 'Group/51007/_history/1',
                etag: '1',
                lastModified: '2021-03-26T19:43:01.238+00:00',
              },
            }],
          }),
        )),
      );

      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientSearchScreen /></AppTest>);

      userEvent.click(screen.getByText('Nouvelle prescription'), null);

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.type(screen.getByLabelText('RAMQ'), 'DABC01010101');
      userEvent.type(screen.getByLabelText('RAMQ (confirmation)'), 'DABC01010101');

      await waitFor(() => screen.getByLabelText('Nom de famille'));

      userEvent.type(screen.getByLabelText('Nom de famille'), 'Smith');
      userEvent.type(screen.getByLabelText('Prénom'), 'Morty');

      userEvent.click(screen.getByText(/masculin/i), {});
      userEvent.type(screen.getByLabelText('Date de naissance'), '2020-01-01{enter}');

      userEvent.type(screen.getByTestId('mrn-file'), 'AB1234');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CHUSJ');

      expect(screen.getByText(/soumettre/i).closest('button')).toBeEnabled();
      userEvent.click(screen.getByText(/soumettre/i), {});

      await waitFor(() => screen.getByText(/Sauvegarde de données en cours/i));
      await waitFor(() => screen.getByText(/la fiche du patient a été créée avec succès/i));
      expect(screen.getByText('SMITH Morty')).toBeDefined();
    });
  });
});
