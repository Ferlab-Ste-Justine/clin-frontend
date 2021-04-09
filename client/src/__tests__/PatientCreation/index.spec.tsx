import React from 'react';
import {
  queryByText,
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import PatientSearchScreen from '../../components/screens/PatientSearch';

import AppTest from '../../AppTest';

describe('PatientCreation', () => {
  const server = setupServer();

  function setupValidPostmockResponse(isFetus: boolean = false) {
    const responseEntries = [{
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
    }];

    if (isFetus) {
      responseEntries.push({
        response: {
          status: '201 Created',
          location: 'Patient/51007/_history/1',
          etag: '1',
          lastModified: '2021-03-30T20:55:13.309+00:00',
        },
      });
    }

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
          entry: responseEntries,
        }),
      )),
    );
  }

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

      setupValidPostmockResponse();
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

      expect(screen.getByLabelText('Date de naissance')).toHaveValue('2001-01-01');

      expect(screen.getByText(/masculin/i).previousSibling).toHaveClass('ant-radio-button-checked');
      expect(screen.getByLabelText('Date de naissance')).toHaveValue('2001-01-01');
      userEvent.type(screen.getByLabelText('Date de naissance'), '2020-01-01{enter}');

      userEvent.type(screen.getByTestId('mrn-file'), 'AB1234');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CHUSJ');

      expect(screen.getByText(/soumettre/i).closest('button')).toBeEnabled();
      userEvent.click(screen.getByText(/soumettre/i), {});

      await waitFor(() => screen.getByText(/Sauvegarde de données en cours/i));
      await waitFor(() => screen.getByText(/la fiche du patient a été créée avec succès/i));
      expect(screen.getByText('SMITH Morty')).toBeDefined();
    });

    test('as a patient WITHOUT ramq', async () => {
      setupValidPostmockResponse();
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
            link: [],
          }),
        )),
      );

      server.listen({ onUnhandledRequest: 'error' });
      server.printHandlers();

      render(<AppTest><PatientSearchScreen /></AppTest>);

      userEvent.click(screen.getByText('Nouvelle prescription'), null);

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.click(screen.getByLabelText(/Aucun numéro RAMQ disponible/i), {});

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

  describe('Create a fetus', () => {
    test("with the mother's RAMQ", async () => {
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
            link: [],
          }),
        )),
      );

      setupValidPostmockResponse(true);
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientSearchScreen /></AppTest>);

      userEvent.click(screen.getByText('Nouvelle prescription'), null);

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.click(screen.getByText(/foetus/i), {});

      expect(screen.getAllByText(/foetus/i)[0].parentNode).toHaveClass('ant-radio-button-wrapper-checked');

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.type(screen.getByLabelText('RAMQ'), 'DABC01010101');
      userEvent.type(screen.getByLabelText('RAMQ (confirmation)'), 'DABC01010101');

      await waitFor(() => screen.getByLabelText('Nom de famille (mère)'));

      userEvent.type(screen.getByLabelText('Nom de famille (mère)'), 'Smith');
      userEvent.type(screen.getByLabelText('Prénom (mère)'), 'Beth');

      userEvent.click(screen.getByText(/masculin/i), {});

      userEvent.type(screen.getByTestId('mrn-file'), 'AB1234');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CHUSJ');

      expect(screen.getByText(/soumettre/i).closest('button')).toBeEnabled();
      userEvent.click(screen.getByText(/soumettre/i), {});

      await waitFor(() => screen.getByText(/Sauvegarde de données en cours/i));

      await waitFor(() => screen.getByText(/La fiche du foetus a été créée avec succès/i));

      expect(screen.getByText('SMITH Beth (foetus)')).toBeDefined();
    });

    test("without the mother's RAMQ", async () => {
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
            link: [],
          }),
        )),
      );

      setupValidPostmockResponse(true);
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientSearchScreen /></AppTest>);

      userEvent.click(screen.getByText('Nouvelle prescription'), null);

      userEvent.click(screen.getByText(/foetus/i), {});

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.click(screen.getByLabelText(/Aucun numéro RAMQ disponible/i), {});

      await waitFor(() => screen.getByLabelText('Nom de famille (mère)'));

      userEvent.type(screen.getByLabelText('Nom de famille (mère)'), 'Smith');
      userEvent.type(screen.getByLabelText('Prénom (mère)'), 'Beth');

      userEvent.click(screen.getByText(/masculin/i), {});

      userEvent.type(screen.getByTestId('mrn-file'), 'AB1234');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CHUSJ');

      expect(screen.getByText(/soumettre/i).closest('button')).toBeEnabled();
      userEvent.click(screen.getByText(/soumettre/i), {});

      await waitFor(() => screen.getByText(/Sauvegarde de données en cours/i));
      await waitFor(() => screen.getByText(/La fiche du foetus a été créée avec succès/i));

      expect(screen.getByText('SMITH Beth (foetus)')).toBeDefined();
    });

    test('with an existing RAMQ', async () => {
      const ramq = 'BETS00000001';

      server.use(
        rest.get('https://fhir.qa.clin.ferlab.bio/fhir/Patient', (req, res, ctx) => {
          let entry;

          if (req.url.href.includes(ramq)) {
            entry = [{
              fullUrl: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient/54382',
              resource: {
                resourceType: 'Patient',
                id: '54382',
                meta: {
                  versionId: '2',
                  lastUpdated: '2021-03-30T17:16:35.931+00:00',
                  source: '#5987279aae2ec2ca',
                  profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
                },
                text: {
                  status: 'generated',
                  div: '',
                },
                extension: [{
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
                  valueBoolean: true,
                }, {
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus',
                  valueBoolean: false,
                }, {
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
                  valueReference: {
                    reference: 'Group/38410',
                  },
                }],
                identifier: [{
                  type: {
                    coding: [{
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'MR',
                      display: 'Medical record number',
                    }],
                    text: 'Numéro du dossier médical',
                  },
                  value: '010000',
                  assigner: {
                    reference: 'Organization/CUSM',
                  },
                }, {
                  type: {
                    coding: [{
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'JHN',
                      display: 'Jurisdictional health number (Canada)',
                    }],
                    text: 'Numéro du dossier médical',
                  },
                  value: 'BETS00000001',
                }],
                active: true,
                name: [{
                  family: 'Smith',
                  given: ['Beth'],
                }],
                gender: 'female',
                birthDate: '2021-03-30',
                generalPractitioner: [{
                  reference: 'PractitionerRole/PROLE-40998dab-554d-402d-b245-39187b14cdf8',
                }, {
                  reference: 'PractitionerRole/PROLE-c4becdcf-87e1-4fa7-ae87-9bbf555b1c4f',
                }],
                managingOrganization: {
                  reference: 'Organization/CUSM',
                },
              },
              search: {
                mode: 'match',
              },
            }];
          }

          return res(
            ctx.status(200),
            ctx.json({
              resourceType: 'Bundle',
              id: '2acbea67-8d49-477b-bbae-7acb18430780',
              meta: {
                lastUpdated: '2021-03-19T18:49:41.787+00:00',
              },
              type: 'searchset',
              total: 0,
              link: [],
              entry,
            }),
          );
        }),
      );

      setupValidPostmockResponse(true);
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientSearchScreen /></AppTest>);

      userEvent.click(screen.getByText('Nouvelle prescription'), null);

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.click(screen.getByText(/foetus/i), {});

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.type(screen.getByLabelText('RAMQ'), ramq);
      userEvent.type(screen.getByLabelText('RAMQ (confirmation)'), ramq);

      await waitFor(() => screen.getByLabelText('Nom de famille (mère)'));

      expect(screen.getByLabelText('Nom de famille (mère)')).toBeDisabled();
      expect(screen.getByLabelText('Prénom (mère)')).toBeDisabled();
      expect(screen.getByTestId('mrn-file')).toHaveValue('010000');
      expect(screen.getByTestId('mrn-organization')).toHaveValue('CUSM');

      userEvent.click(screen.getByText(/masculin/i), {});

      expect(screen.getByText(/soumettre/i).closest('button')).toBeEnabled();
      userEvent.click(screen.getByText(/soumettre/i), {});

      await waitFor(() => screen.getByText(/Sauvegarde de données en cours/i));

      await waitFor(() => screen.getByText(/La fiche du foetus a été créée avec succès/i));

      expect(screen.getByText('SMITH Beth (foetus)')).toBeDefined();
    });
  });

  describe('Should not be able to create a patient', () => {
    test('with an existing RAMQ', async () => {
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
              url: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient?identifier=BETS00000001',
            }],
            entry: [{
              fullUrl: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient/54382',
              resource: {
                resourceType: 'Patient',
                id: '54382',
                meta: {
                  versionId: '2',
                  lastUpdated: '2021-03-30T17:16:35.931+00:00',
                  source: '#5987279aae2ec2ca',
                  profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
                },
                text: {
                  status: 'generated',
                  div: '',
                },
                extension: [{
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
                  valueBoolean: true,
                }, {
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus',
                  valueBoolean: false,
                }, {
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
                  valueReference: {
                    reference: 'Group/38410',
                  },
                }],
                identifier: [{
                  type: {
                    coding: [{
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'MR',
                      display: 'Medical record number',
                    }],
                    text: 'Numéro du dossier médical',
                  },
                  value: '010000',
                  assigner: {
                    reference: 'Organization/CUSM',
                  },
                }, {
                  type: {
                    coding: [{
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'JHN',
                      display: 'Jurisdictional health number (Canada)',
                    }],
                    text: 'Numéro du dossier médical',
                  },
                  value: 'BETS00000001',
                }],
                active: true,
                name: [{
                  family: 'Smith',
                  given: ['Beth'],
                }],
                gender: 'female',
                birthDate: '2021-03-30',
                generalPractitioner: [{
                  reference: 'PractitionerRole/PROLE-40998dab-554d-402d-b245-39187b14cdf8',
                }, {
                  reference: 'PractitionerRole/PROLE-c4becdcf-87e1-4fa7-ae87-9bbf555b1c4f',
                }],
                managingOrganization: {
                  reference: 'Organization/CUSM',
                },
              },
              search: {
                mode: 'match',
              },
            }],
          }),
        )),
      );

      setupValidPostmockResponse();
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientSearchScreen /></AppTest>);

      userEvent.click(screen.getByText('Nouvelle prescription'), null);

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.type(screen.getByLabelText('RAMQ'), 'BETS00000001');
      userEvent.type(screen.getByLabelText('RAMQ (confirmation)'), 'BETS00000001');

      await waitFor(() => screen.getByText(/Nous avons trouvé une fiche avec les mêmes identifiants./i));
      expect(screen.getByText('SMITH Beth')).toBeDefined();
    });

    test('with an existing MRN', async () => {
      server.use(
        rest.get('https://fhir.qa.clin.ferlab.bio/fhir/Patient', (req, res, ctx) => {
          let entry;
          if (req.url.href.includes('CUSM') && req.url.href.includes('010000')) {
            entry = [{
              fullUrl: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient/54382',
              resource: {
                resourceType: 'Patient',
                id: '54382',
                meta: {
                  versionId: '2',
                  lastUpdated: '2021-03-30T17:16:35.931+00:00',
                  source: '#5987279aae2ec2ca',
                  profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
                },
                text: {
                  status: 'generated',
                  div: '',
                },
                extension: [{
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
                  valueBoolean: true,
                }, {
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus',
                  valueBoolean: false,
                }, {
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
                  valueReference: {
                    reference: 'Group/38410',
                  },
                }],
                identifier: [{
                  type: {
                    coding: [{
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'MR',
                      display: 'Medical record number',
                    }],
                    text: 'Numéro du dossier médical',
                  },
                  value: '010000',
                  assigner: {
                    reference: 'Organization/CUSM',
                  },
                }, {
                  type: {
                    coding: [{
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'JHN',
                      display: 'Jurisdictional health number (Canada)',
                    }],
                    text: 'Numéro du dossier médical',
                  },
                  value: 'BETS00000001',
                }],
                active: true,
                name: [{
                  family: 'Smith',
                  given: ['Beth'],
                }],
                gender: 'female',
                birthDate: '2021-03-30',
                generalPractitioner: [{
                  reference: 'PractitionerRole/PROLE-40998dab-554d-402d-b245-39187b14cdf8',
                }, {
                  reference: 'PractitionerRole/PROLE-c4becdcf-87e1-4fa7-ae87-9bbf555b1c4f',
                }],
                managingOrganization: {
                  reference: 'Organization/CUSM',
                },
              },
              search: {
                mode: 'match',
              },
            }];
          }
          return res(
            ctx.status(200),
            ctx.json({
              resourceType: 'Bundle',
              id: '2acbea67-8d49-477b-bbae-7acb18430780',
              meta: {
                lastUpdated: '2021-03-19T18:49:41.787+00:00',
              },
              type: 'searchset',
              total: 0,
              link: [],
              entry,
            }),
          );
        }),
      );

      server.listen({ onUnhandledRequest: 'error' });
      server.printHandlers();

      render(<AppTest><PatientSearchScreen /></AppTest>);

      userEvent.click(screen.getByText('Nouvelle prescription'), null);

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.click(screen.getByLabelText(/Aucun numéro RAMQ disponible/i), {});

      await waitFor(() => screen.getByLabelText('Nom de famille'));

      userEvent.type(screen.getByLabelText('Nom de famille'), 'Smith');
      userEvent.type(screen.getByLabelText('Prénom'), 'Morty');

      userEvent.click(screen.getByText(/masculin/i), {});
      userEvent.type(screen.getByLabelText('Date de naissance'), '2020-01-01{enter}');

      userEvent.type(screen.getByTestId('mrn-file'), '010000');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CUSM');

      await waitFor(() => screen.getAllByText(/Le numéro de dossier existe déjà pour cet hôpital/i));
      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
    });
  });

  describe('should reset the form', () => {
    test('when finding a patient with their RAMQ', async () => {
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
              url: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient?identifier=BETS00000001',
            }],
            entry: [{
              fullUrl: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient/54382',
              resource: {
                resourceType: 'Patient',
                id: '54382',
                meta: {
                  versionId: '2',
                  lastUpdated: '2021-03-30T17:16:35.931+00:00',
                  source: '#5987279aae2ec2ca',
                  profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
                },
                text: {
                  status: 'generated',
                  div: '',
                },
                extension: [{
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
                  valueBoolean: true,
                }, {
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus',
                  valueBoolean: false,
                }, {
                  url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
                  valueReference: {
                    reference: 'Group/38410',
                  },
                }],
                identifier: [{
                  type: {
                    coding: [{
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'MR',
                      display: 'Medical record number',
                    }],
                    text: 'Numéro du dossier médical',
                  },
                  value: '010000',
                  assigner: {
                    reference: 'Organization/CUSM',
                  },
                }, {
                  type: {
                    coding: [{
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'JHN',
                      display: 'Jurisdictional health number (Canada)',
                    }],
                    text: 'Numéro du dossier médical',
                  },
                  value: 'BETS00000001',
                }],
                active: true,
                name: [{
                  family: 'Smith',
                  given: ['Beth'],
                }],
                gender: 'female',
                birthDate: '2021-03-30',
                generalPractitioner: [{
                  reference: 'PractitionerRole/PROLE-40998dab-554d-402d-b245-39187b14cdf8',
                }, {
                  reference: 'PractitionerRole/PROLE-c4becdcf-87e1-4fa7-ae87-9bbf555b1c4f',
                }],
                managingOrganization: {
                  reference: 'Organization/CUSM',
                },
              },
              search: {
                mode: 'match',
              },
            }],
          }),
        )),
      );

      setupValidPostmockResponse();
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientSearchScreen /></AppTest>);

      userEvent.click(screen.getByText('Nouvelle prescription'), null);

      expect(screen.getByText(/soumettre/i).closest('button')).toBeDisabled();
      userEvent.type(screen.getByLabelText('RAMQ'), 'BETS00000001');
      userEvent.type(screen.getByLabelText('RAMQ (confirmation)'), 'BETS00000001');

      await waitFor(() => screen.getByText(/Nous avons trouvé une fiche avec les mêmes identifiants./i));
      expect(screen.getByText('SMITH Beth')).toBeDefined();

      userEvent.click(screen.getByText(/Fermer/i).closest('button'), {});
      userEvent.click(screen.getAllByText('Nouvelle prescription')[0], null);

      expect(screen.getByLabelText('RAMQ')).toHaveValue('');
    });

    test('when changing the patient type', async () => {
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
              url: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient?identifier=BETS00000001',
            }],
          }),
        )),
      );

      setupValidPostmockResponse();
      server.listen({ onUnhandledRequest: 'error' });

      server.printHandlers();

      render(<AppTest><PatientSearchScreen /></AppTest>);

      userEvent.click(screen.getByText('Nouvelle prescription'), null);

      // Fill the form
      userEvent.type(screen.getByLabelText('RAMQ'), 'BETS00000001');
      userEvent.type(screen.getByLabelText('RAMQ (confirmation)'), 'BETS00000001');

      await waitFor(() => screen.getByLabelText('Nom de famille'));

      userEvent.type(screen.getByLabelText('Nom de famille'), 'Smith');
      userEvent.type(screen.getByLabelText('Prénom'), 'Morty');

      userEvent.click(screen.getByText(/masculin/i), {});
      userEvent.type(screen.getByLabelText('Date de naissance'), '2020-01-01{enter}');

      userEvent.type(screen.getByTestId('mrn-file'), 'AB1234');

      userEvent.selectOptions(screen.getByTestId('mrn-organization'), 'CHUSJ');

      userEvent.click(screen.getByText(/foetus/i), {});

      expect(screen.getByLabelText('RAMQ')).toHaveValue('');
      expect(screen.getByLabelText('RAMQ (confirmation)')).toHaveValue('');
      expect(queryByText(screen.getByRole('dialog'), 'Nom de famille')).not.toBeInTheDocument();
    });
  });

  test('mrn number should only accept alpha numerical charactar', async () => {
    render(<AppTest><PatientSearchScreen /></AppTest>);
    userEvent.click(screen.getByText('Nouvelle prescription'), null);
    userEvent.click(screen.getByLabelText(/Aucun numéro RAMQ disponible/i), {});

    userEvent.type(screen.getByTestId('mrn-file'), 'abc-123()/é');
    expect(screen.getByTestId('mrn-file')).toHaveValue('abc123');
  });
});
