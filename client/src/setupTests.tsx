/* eslint-disable import/no-extraneous-dependencies */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import React from 'react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Inspired by https://github.com/ant-design/ant-design/issues/21080#issuecomment-643196078
// Ant Design Select component isn't easily selectable so we mock it with the default html one
// and changed some part to mimick AntD's version
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');

  const Select = ({ children, onChange, ...otherProps }: any) => (
    <select
      {...otherProps}
      onChange={(e) => onChange(e.target.value)}
    >{ children }
    </select>
  );

  Select.Option = ({ children, ...otherProps }: any) => <option {...otherProps}>{ children }</option>;

  return {
    ...antd,
    Select,
  };
});

// JSDom used by Jest doesn't support matchMedia and some part of AntD use this
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

const handlers = [
  rest.get('https://patient.qa.clin.ferlab.bio/patient/search', (req, res, ctx) => res(ctx.json({
    timestamp: 1616172089870,
    message: 'Ok',
    data: {
      total: 77,
      hits: [{
        _index: 'patient-list',
        _type: '_doc',
        _id: '40257',
        _score: null,
        _source: {
          id: '40257',
          organization: { id: 'Organization/CHUM', name: '' },
          lastName: 'Harvey',
          firstName: 'Specter',
          gender: 'Male',
          birthDate: '2021-03-01',
          practitioner: { id: 'PractitionerRole/PROLE-78a60801-cbab-4064-93c6-d85aeadc1edb', lastName: 'Moussaoui', firstName: 'Yanis' },
          mrn: '1324',
          ramq: '45678',
          position: 'Proband',
          familyId: '40258',
          familyType: 'Solo',
          ethnicity: '',
          bloodRelationship: '',
          timestamp: '2021-03-19T16:36:33.809312Z',
          fetus: false,
          requests: [{
            request: '40247', status: 'draft', test: 'PTSE', submitted: false, prescription: '2021-03-17',
          }, {
            request: '40248', status: 'active', test: 'RET', submitted: true, prescription: '2021-03-17',
          }, {
            request: '42994', status: 'draft', test: 'PCA', submitted: false, prescription: '2021-03-18',
          }],
        },
        sort: [1616171793809, '40257'],
      }],
    },
  }))),
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
];

export const server = setupServer(...handlers);

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
