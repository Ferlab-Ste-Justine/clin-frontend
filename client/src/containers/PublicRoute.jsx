import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

const PublicRoute = ({ Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => (
      <Component {...props} />
    )}
  />
);

PublicRoute.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.func]).isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default withRouter(PublicRoute);
