import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { userShape } from '../reducers/user';

const PrivateRoute = ({ Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      !rest.user.username
        ? <Redirect to="/" />
        : <Component {...props} />
    )
    }
  />
);

PrivateRoute.defaultProps = {
  user: userShape,
};

PrivateRoute.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.func]).isRequired,
  user: PropTypes.shape(userShape),
};


export default PrivateRoute;
