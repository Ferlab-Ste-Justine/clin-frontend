/* eslint-disable import/no-extraneous-dependencies */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import React from 'react';
import '@testing-library/jest-dom';

// @ts-ignore
process.env.REACT_APP_KEYCLOAK_CONFIG = '{}';

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
