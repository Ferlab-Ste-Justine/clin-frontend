import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { act } from 'react-dom/test-utils';
import AppTest from '../../AppTest';
import Patient from '../../components/screens/Patient';
import { FakeStateProvider } from '../utils/FakeStateProvider';
import { ResourceBuilder } from '../utils/Utils';
import { mockRptToken } from '../mocks';
import { FamilyMemberType } from '../../helpers/providers/types';

function parentPatientBundle(patientId: string, firstName: string, lastName: string) {
  return {
    resourceType: 'Bundle',
    id: 'ID',
    type: 'batch-response',
    link: [{
      relation: 'self',
      url: 'https://fhir.qa.clin.ferlab.bio/fhir',
    }],
    entry: [{
      resource: {
        resourceType: 'Bundle',
        id: 'ID',
        meta: {
          lastUpdated: '2021-05-25T20:44:12.481+00:00',
        },
        type: 'searchset',
        total: 1,
        link: [{
          relation: 'self',
          url: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient?_id=22412',
        }],
        entry: [{
          fullUrl: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient/22412',
          resource: {
            resourceType: 'Patient',
            id: patientId,
            meta: {
              versionId: '3',
              lastUpdated: '2021-05-18T20:46:02.665+00:00',
              source: 'source',
              profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
            },
            text: {
              status: 'generated',
              div: 'text-div',
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
                reference: 'Group/22413',
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
              value: 'ID00001',
              assigner: {
                reference: 'Organization/CHUSJ',
              },
            }, {
              type: {
                coding: [{
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical record number',
                }],
                text: 'Numéro du dossier médical',
              },
              value: 'test123',
              assigner: {
                reference: 'Organization/CHUSJ',
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
              value: 'SANR80010101',
            }],
            active: true,
            name: [{
              family: lastName,
              given: [firstName],
            }],
            gender: 'male',
            birthDate: '1980-01-01',
            generalPractitioner: [{
              reference: 'PractitionerRole/PR001',
            }, {
              reference: 'PractitionerRole/PR002',
            }, {
              reference: 'PractitionerRole/PR003',
            }],
            managingOrganization: {
              reference: 'Organization/CHUSJ',
            },
          },
          search: {
            mode: 'match',
          },
        }],
      },
    }],
  };
}

function mainPatientLoadBundle(
  patientId: string, firstName: string, lastName: string, parents: {id: string, type: FamilyMemberType}[],
) {
  return {
    resourceType: 'Bundle',
    id: 'ID',
    type: 'batch-response',
    link: [{
      relation: 'self',
      url: 'https://fhir.qa.clin.ferlab.bio/fhir',
    }],
    entry: [{
      resource: {
        resourceType: 'Bundle',
        id: 'ID',
        meta: {
          lastUpdated: '2021-05-25T20:44:12.481+00:00',
        },
        type: 'searchset',
        total: 1,
        link: [{
          relation: 'self',
          url: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient?_id=22412',
        }],
        entry: [{
          fullUrl: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient/22412',
          resource: {
            resourceType: 'Patient',
            id: patientId,
            meta: {
              versionId: '3',
              lastUpdated: '2021-05-18T20:46:02.665+00:00',
              source: '#446a00ada57bccc4',
              profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
            },
            text: {
              status: 'generated',
              div: 'text-div',
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
                reference: 'Group/22413',
              },
            },
            ...(parents || []).map((p) => ({
              url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
              extension: [{
                url: 'subject',
                valueReference: {
                  reference: `Patient/${p.id}`,
                },
              }, {
                url: 'relation',
                valueCodeableConcept: {
                  coding: [{
                    system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
                    code: p.type,
                  }],
                },
              }],
            })),
            ],
            identifier: [{
              type: {
                coding: [{
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical record number',
                }],
                text: 'Numéro du dossier médical',
              },
              value: 'ID00001',
              assigner: {
                reference: 'Organization/CHUSJ',
              },
            }, {
              type: {
                coding: [{
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical record number',
                }],
                text: 'Numéro du dossier médical',
              },
              value: 'test123',
              assigner: {
                reference: 'Organization/CHUSJ',
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
              value: 'SANR80010101',
            }],
            active: true,
            name: [{
              family: lastName,
              given: [firstName],
            }],
            gender: 'male',
            birthDate: '1980-01-01',
            generalPractitioner: [{
              reference: 'PractitionerRole/PR0001',
            }, {
              reference: 'PractitionerRole/PR0002',
            }, {
              reference: 'PractitionerRole/PR0003',
            }],
            managingOrganization: {
              reference: 'Organization/CHUSJ',
            },
          },
          search: {
            mode: 'match',
          },
        },
        {
          fullUrl: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient/19818',
          resource: {
            resourceType: 'Organization',
            id: 'CHUSJ',
            meta: {
              versionId: '53',
              lastUpdated: '2020-12-17T18:14:12.758+00:00',
              source: '#4f8e7f72c1522a75',
              profile: [
                'http://hl7.org/fhir/StructureDefinition/Organization',
              ],
            },
            type: [
              {
                coding: [
                  {
                    code: 'prov',
                    display: 'Healthcare Provider',
                  },
                ],
              },
            ],
            name: 'CHU Sainte-Justine - Centre hospitalier universitaire mère-enfant',
            alias: [
              'CHUSJ',
            ],
          },
        }],
      },
      response: {
        status: '200 OK',
      },
    }, {
      resource: {
        resourceType: 'Bundle',
        id: 'ID',
        meta: {
          lastUpdated: '2021-05-25T20:44:12.508+00:00',
        },
        type: 'searchset',
        total: 1,
        link: [{
          relation: 'self',
          url: 'https://fhir.qa.clin.ferlab.bio/fhir/Patient?_id=19818',
        }],
        entry: [{
          fullUrl: 'http://fhir.cqgc.ferlab.bio',
          resource: {
            resourceType: 'Group',
            meta: {
              profile: [
                'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-family-group',
              ],
            },
            type: 'person',
            actual: true,
            member: [
              {
                entity: {
                  reference: 'Patient/1',
                },
              }, {
                entity: {
                  reference: 'Patient/3',
                },
              },
            ],
            extension: [
              {
                url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/fm-structure',
                valueCoding: {
                  code: 'SOL',
                  display: 'Solo',
                  system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/fm-structure',
                },
              },
            ],
          },
        }],
      },
      response: {
        status: '200 OK',
      },
    }],
  };
}

describe('Patient/Family', () => {
  const server = setupServer();

  beforeAll(() => {
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test('Empty state', async () => {
    const patient = new ResourceBuilder()
      .withPatient({
        firstName: 'FirstName',
        lastName: 'TestLastName',
      })
      .setBundle(false)
      .build()[0];

    const additionalState = FakeStateProvider.emptyPatientState(patient);
    render(
      <AppTest additionalStateInfo={{ ...additionalState }}>
        <Patient />
      </AppTest>,
    );

    userEvent.click(screen.getAllByRole('tab')[1], {});

    expect(screen.getByText("Aucune famille n'existe pour ce patient"));
  });

  describe('Creating a mother', () => {
    test('should be enabled and the mother shown in the list', async () => {
      mockRptToken();
      const parentPatient = {
        id: '3',
        firstName: 'Family',
        lastName: 'Test',
        birthDate: '1991-01-01',
        mrn: ['FAMILY12345678'],
        organization: { id: 'Organization/CHUSJ' },
        ramq: 'TESTF91010101',
      };

      const patientData = {
        id: '1',
        firstName: 'FirstName',
        lastName: 'TestLastName',
        familyId: 'FAM01',
        extension: [
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
            extension: [{
              url: 'subject',
              valueReference: {
                reference: 'Patient/3',
              },
            }, {
              url: 'relation',
              valueCodeableConcept: {
                coding: [{
                  system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
                  code: 'FTH',
                }],
              },
            }],
          },
        ],
      };

      const patient = new ResourceBuilder()
        .withPatient(patientData)
        .setBundle(false)
        .build()[0];

      server.use(
        rest.options(
          '*',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.set('access-control-allow-headers', 'authorization, content-type'),
            ctx.set('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD'),
            ctx.set('access-control-allow-origin', '*'),
            ctx.set('access-control-expose-headers', 'Location, Content-Location'),
          ),
        ),
        rest.put(
          'https://fhir.qa.clin.ferlab.bio/fhir/Patient/1',
          (req, res, ctx) => res(ctx.status(200), ctx.json({})),
        ),
        rest.put(
          'https://fhir.qa.clin.ferlab.bio/fhir/Group/0',
          (req, res, ctx) => res(ctx.status(200), ctx.json({})),
        ),
        rest.post(
          'https://patient.qa.clin.ferlab.bio/patient/can-edit',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({ timestamp: 1621951406526, message: 'Ok', data: { result: true } }),
          ),
        ),
        rest.post(
          'https://fhir.qa.clin.ferlab.bio/fhir',
          (req, res, ctx) => {
            // @ts-ignore
            if (req?.body?.entry?.[0].request.url === 'Patient?_id=3') {
              return res(
                ctx.status(200),
                ctx.json(parentPatientBundle(parentPatient.id, parentPatient.firstName, parentPatient.lastName)),
              );
            }

            return res(
              ctx.status(200),
              ctx.json(mainPatientLoadBundle(
                patientData.id,
                patientData.firstName,
                patientData.lastName,
                [{ id: parentPatient.id, type: FamilyMemberType.MOTHER }],
              )),
            );
          }
          ,
        ),
        rest.get(
          'https://patient.qa.clin.ferlab.bio/patient/autocomplete',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({
              timestamp: 1621457752138,
              message: 'Ok',
              data: {
                total: 55,
                hits: [{
                  _index: 'patients',
                  _type: '_doc',
                  _id: '1',
                  _score: 4.5239224,
                  _source: {
                    lastName: 'Test', firstName: 'Test', mrn: ['test10'], id: '1',
                  },
                }, {
                  _index: 'patients',
                  _type: '_doc',
                  _id: '2',
                  _score: 3.8794994,
                  _source: {
                    lastName: 'Sanchez', firstName: 'Rick', mrn: ['RS80010101', 'test123'], id: '2',
                  },
                }, {
                  _index: 'patients',
                  _type: '_doc',
                  _id: '3',
                  _score: 0.8255718,
                  _source: {
                    lastName: 'Test', firstName: 'Family', mrn: ['FAMILY12345678'], id: '3',
                  },
                }],
              },
            }),
          ),
        ),
        rest.get(
          'https://patient.qa.clin.ferlab.bio/patient/3',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({
              timestamp: 1621457752138,
              message: 'Ok',
              data: parentPatient,
            }),
          ),
        ),
        rest.get(
          'https://patient.qa.clin.ferlab.bio/patient/1',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({
              timestamp: 1621457752138,
              message: 'Ok',
              data: patient,
            }),
          ),
        ),
        rest.get(
          'https://fhir.qa.clin.ferlab.bio/fhir/Group',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({
              resourceType: 'Bundle',
              id: 'b00639ba-3794-4f9d-b1b5-17a345df1a44',
              meta: {
                lastUpdated: '2021-05-20T20:25:30.617+00:00',
              },
              type: 'searchset',
              link: [{
                relation: 'self',
                url: 'https://fhir.qa.clin.ferlab.bio/fhir/Group?_id=FAM01',
              }],
              entry: [{
                fullUrl: 'https://fhir.qa.clin.ferlab.bio/fhir/Group/FAM01',
                resource: {
                  resourceType: 'Group',
                  id: 'FAM01',
                  meta: {
                    versionId: '2',
                    lastUpdated: '2021-05-20T18:18:43.031+00:00',
                    source: '#3734dab50afa3838',
                    profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-family-group'],
                  },
                  extension: [{
                    url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/fm-structure',
                    valueCoding: {
                      system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/fm-structure',
                      code: 'SOL',
                      display: 'Solo',
                    },
                  }],
                  type: 'person',
                  actual: true,
                  member: [{
                    entity: {
                      reference: 'Patient/1',
                    },
                  }, {
                    entity: {
                      reference: 'Patient/3',
                    },
                  }],
                },
                search: {
                  mode: 'match',
                },
              }],
            }),
          ),
        ),
      );

      server.printHandlers();
      server.listen({ onUnhandledRequest: 'error' });

      const additionalState = FakeStateProvider.emptyPatientState(patient);
      render(
        <AppTest additionalStateInfo={{ ...additionalState }}>
          <Patient />
        </AppTest>,
      );

      userEvent.click(screen.getAllByRole('tab')[1], {});

      userEvent.click(screen.getByText('Ajouter un parent'), {});
      await waitFor(() => expect(screen.getByText('Mère')).toBeVisible());
      userEvent.click(screen.getByText('Mère'), {});

      userEvent.type(screen.getByRole('combobox'), 'test');

      const autocompleteElement = (await screen.findByText(/TEST Family/i)).parentElement;
      act(() => userEvent.click(autocompleteElement, {}));

      await waitFor(() => screen.getByText(/TESTF91010101/i));

      expect(screen.getByText(/TESTF91010101/i)).toBeVisible();

      userEvent.click(screen.getByText('Ajouter'), {});

      await waitFor(() => screen.getByText('Familly (trio seulement)'));
      await waitFor(() => screen.getAllByText(/Family Test/i));

      expect(screen.getAllByText(/Family Test/i).length).toEqual(2);

      userEvent.click(screen.getByText('Ajouter un parent'), {});
      // The mother "add parent" is disabled when there's already a created mother
      await waitFor(() => expect(screen.getAllByText('Mère')[0]).toHaveAttribute('aria-disabled', 'true'));
    });
  });

  describe('Create father', () => {
    test('should be enabled and the father shown in the list', async () => {
      mockRptToken();
      const parentPatient = {
        id: '3',
        firstName: 'Family',
        lastName: 'Test',
        birthDate: '1991-01-01',
        mrn: ['FAMILY12345678'],
        organization: { id: 'Organization/CHUSJ' },
        ramq: 'TESTF91010101',
      };

      const patientData = {
        id: '1',
        firstName: 'FirstName',
        lastName: 'TestLastName',
        familyId: 'FAM01',
        extension: [
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
            extension: [{
              url: 'subject',
              valueReference: {
                reference: 'Patient/3',
              },
            }, {
              url: 'relation',
              valueCodeableConcept: {
                coding: [{
                  system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
                  code: 'FTH',
                }],
              },
            }],
          },
        ],
      };

      const patient = new ResourceBuilder()
        .withPatient(patientData)
        .setBundle(false)
        .build()[0];

      server.use(
        rest.options(
          '*',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.set('access-control-allow-headers', 'authorization, content-type'),
            ctx.set('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD'),
            ctx.set('access-control-allow-origin', '*'),
            ctx.set('access-control-expose-headers', 'Location, Content-Location'),
          ),
        ),
        rest.put(
          'https://fhir.qa.clin.ferlab.bio/fhir/Patient/1',
          (req, res, ctx) => res(ctx.status(200), ctx.json({})),
        ),
        rest.put(
          'https://fhir.qa.clin.ferlab.bio/fhir/Group/0',
          (req, res, ctx) => res(ctx.status(200), ctx.json({})),
        ),
        rest.post(
          'https://patient.qa.clin.ferlab.bio/patient/can-edit',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({ timestamp: 1621951406526, message: 'Ok', data: { result: true } }),
          ),
        ),
        rest.post(
          'https://fhir.qa.clin.ferlab.bio/fhir',
          (req, res, ctx) => {
            // @ts-ignore
            if (req?.body?.entry?.[0].request.url === 'Patient?_id=3') {
              return res(
                ctx.status(200),
                ctx.json(parentPatientBundle(parentPatient.id, parentPatient.firstName, parentPatient.lastName)),
              );
            }

            return res(
              ctx.status(200),
              ctx.json(mainPatientLoadBundle(
                patientData.id,
                patientData.firstName,
                patientData.lastName,
                [{ id: parentPatient.id, type: FamilyMemberType.FATHER }],
              )),
            );
          }
          ,
        ),
        rest.get(
          'https://patient.qa.clin.ferlab.bio/patient/autocomplete',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({
              timestamp: 1621457752138,
              message: 'Ok',
              data: {
                total: 55,
                hits: [{
                  _index: 'patients',
                  _type: '_doc',
                  _id: '1',
                  _score: 4.5239224,
                  _source: {
                    lastName: 'Test', firstName: 'Test', mrn: ['test10'], id: '1',
                  },
                }, {
                  _index: 'patients',
                  _type: '_doc',
                  _id: '2',
                  _score: 3.8794994,
                  _source: {
                    lastName: 'Sanchez', firstName: 'Rick', mrn: ['RS80010101', 'test123'], id: '2',
                  },
                }, {
                  _index: 'patients',
                  _type: '_doc',
                  _id: '3',
                  _score: 0.8255718,
                  _source: {
                    lastName: 'Test', firstName: 'Family', mrn: ['FAMILY12345678'], id: '3',
                  },
                }],
              },
            }),
          ),
        ),
        rest.get(
          'https://patient.qa.clin.ferlab.bio/patient/3',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({
              timestamp: 1621457752138,
              message: 'Ok',
              data: parentPatient,
            }),
          ),
        ),
        rest.get(
          'https://patient.qa.clin.ferlab.bio/patient/1',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({
              timestamp: 1621457752138,
              message: 'Ok',
              data: patient,
            }),
          ),
        ),
        rest.get(
          'https://fhir.qa.clin.ferlab.bio/fhir/Group',
          (req, res, ctx) => res(
            ctx.status(200),
            ctx.json({
              resourceType: 'Bundle',
              id: 'b00639ba-3794-4f9d-b1b5-17a345df1a44',
              meta: {
                lastUpdated: '2021-05-20T20:25:30.617+00:00',
              },
              type: 'searchset',
              link: [{
                relation: 'self',
                url: 'https://fhir.qa.clin.ferlab.bio/fhir/Group?_id=FAM01',
              }],
              entry: [{
                fullUrl: 'https://fhir.qa.clin.ferlab.bio/fhir/Group/FAM01',
                resource: {
                  resourceType: 'Group',
                  id: 'FAM01',
                  meta: {
                    versionId: '2',
                    lastUpdated: '2021-05-20T18:18:43.031+00:00',
                    source: '#3734dab50afa3838',
                    profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-family-group'],
                  },
                  extension: [{
                    url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/fm-structure',
                    valueCoding: {
                      system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/fm-structure',
                      code: 'SOL',
                      display: 'Solo',
                    },
                  }],
                  type: 'person',
                  actual: true,
                  member: [{
                    entity: {
                      reference: 'Patient/1',
                    },
                  }, {
                    entity: {
                      reference: 'Patient/3',
                    },
                  }],
                },
                search: {
                  mode: 'match',
                },
              }],
            }),
          ),
        ),
      );

      server.printHandlers();
      server.listen({ onUnhandledRequest: 'error' });

      const additionalState = FakeStateProvider.emptyPatientState(patient);
      render(
        <AppTest additionalStateInfo={{ ...additionalState }}>
          <Patient />
        </AppTest>,
      );

      userEvent.click(screen.getAllByRole('tab')[1], {});

      userEvent.click(screen.getByText('Ajouter un parent'), {});
      await waitFor(() => expect(screen.getByText('Père')).toBeVisible());
      userEvent.click(screen.getByText('Père'), {});

      userEvent.type(screen.getByRole('combobox'), 'test');

      const autocompleteElement = (await screen.findByText(/TEST Family/i)).parentElement;
      act(() => userEvent.click(autocompleteElement, {}));

      await waitFor(() => screen.getByText(/TESTF91010101/i));

      expect(screen.getByText(/TESTF91010101/i)).toBeVisible();

      userEvent.click(screen.getByText('Ajouter'), {});

      await waitFor(() => screen.getByText('Familly (trio seulement)'));
      await waitFor(() => screen.getAllByText(/Family Test/i));

      expect(screen.getAllByText(/Family Test/i).length).toEqual(2);

      userEvent.click(screen.getByText('Ajouter un parent'), {});
      // The father "add parent" is disabled when there's already a created mother
      await waitFor(() => expect(screen.getAllByText('Père')[0]).toHaveAttribute('aria-disabled', 'true'));
    });
  });

  // The `Modal.confirm` component doesn't show up
  describe.skip('Delete a family member', () => {
    test('should show the table with one member', async () => {
      const patientData = {
        id: '1',
        firstName: 'FirstName',
        lastName: 'TestLastName',
        familyId: 'FAM01',
        extension: [
          {
            url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
            extension: [{
              url: 'subject',
              valueReference: {
                reference: 'Patient/3',
              },
            }, {
              url: 'relation',
              valueCodeableConcept: {
                coding: [{
                  system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
                  code: 'FTH',
                }],
              },
            }],
          },
        ],
      };

      const patient = new ResourceBuilder()
        .withPatient(patientData)
        .setBundle(false)
        .build()[0];

      server.printHandlers();
      server.listen({ onUnhandledRequest: 'error' });

      const additionalState = FakeStateProvider.emptyPatientState(patient, {
        family: [{
          id: '2',
          firstName: 'Mother',
          lastName: 'Name',
          birthDate: '1990-01-01',
          gender: 'female',
          ramq: 'NAMM90510101',
          type: FamilyMemberType.MOTHER,
        }, {
          id: '3',
          firstName: 'Father',
          lastName: 'Name',
          birthDate: '1990-01-01',
          gender: 'male',
          ramq: 'NAMF90010101',
          type: FamilyMemberType.FATHER,
        }],
      });
      render(
        <AppTest additionalStateInfo={{ ...additionalState }}>
          <Patient />
        </AppTest>,
      );

      userEvent.click(screen.getAllByRole('tab')[1], {});

      await waitFor(() => screen.getAllByText(/Mother Name/i));

      expect(screen.getAllByText(/Mother Name/i).length).toEqual(2);

      userEvent.click(screen.getAllByLabelText('Supprimer le parent')[0], {});

      await waitFor(() => screen.getByLabelText('Supprimer'));
      userEvent.click(screen.getByLabelText('Supprimer'), {});
    });

    test.todo('should show "empty state" after deleting the last member');
  });
});
