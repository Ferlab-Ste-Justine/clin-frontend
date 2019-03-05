import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from 'redux-mock-store';

import { App } from './index';

const root = document.createElement('div');

it('renders without crashing', () => {
  ReactDOM.render((<App/>), root);
  ReactDOM.unmountComponentAtNode(root);
});
