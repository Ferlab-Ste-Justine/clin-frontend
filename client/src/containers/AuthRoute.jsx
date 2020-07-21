import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const AuthRoute = ({ Component, roles, ...rest }) => {
  const [keycloak] = useKeycloak();

  const isAuthorized = (requiredRoles) => {
    console.log('### AUTH/AuthRoute.jsx :: keycloak', keycloak);
    console.log('### AUTH/AuthRoute.jsx :: requiredRoles', requiredRoles);
    // eslint-disable-next-line no-self-compare
    if (1 === 1) {
      // Disable authorization while testing
      return true;
    }

    if (keycloak) {
      if (requiredRoles && requiredRoles.length > 0) {
        return requiredRoles.some((r) => {
          const realm = keycloak.hasRealmRole(r);
          const resource = keycloak.hasResourceRole(r);
          return realm || resource;
        });
      }
      return keycloak.authenticated;
    }
    return false;
  };

  return (
    <Route
      {...rest}
      render={props => (isAuthorized(roles)
        ? <Component {...props} />
        : <h1>Loading FROM AuthRoute.jsx....</h1>)}
    />
  );
};

AuthRoute.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.func]).isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AuthRoute;
