/* eslint-disable no-undef */
import React from 'react';
import ReactDOM from '@hot-loader/react-dom';

import NoMatch from '../../components/screens/NoMatch';

const root = document.createElement('div');

it('renders without crashing', () => {
  ReactDOM.render(<NoMatch />, root);
});
