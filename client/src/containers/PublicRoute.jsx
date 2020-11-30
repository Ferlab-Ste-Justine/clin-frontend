import React from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PublicRoute = ({ Component, roles, ...rest }) => (
  <Route
    {...rest}
    render={(props) => (
      <Component {...props} />
    )}
  />
);

PublicRoute.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.func]).isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(PublicRoute);
