import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';

import { isLoggedIn } from '../helpers/route';


const PrivateRoute = ({ Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      !isLoggedIn()
        ? <Redirect to="/" />
        : <Component {...props} />
    )
    }
  />
);

PrivateRoute.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.func]).isRequired,
};

export default PrivateRoute;
