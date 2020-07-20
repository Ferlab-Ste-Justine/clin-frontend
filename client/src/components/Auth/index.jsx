import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const propTypes = {
  Component: PropTypes.element.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const AuthRoute = ({ Component, roles, ...rest }) => {
  const [keycloak, initialized] = useKeycloak();

  const isAuthorized = (requiredRoles) => {
    if (keycloak && requiredRoles) {
      return requiredRoles.some((r) => {
        const realm = keycloak.hasRealmRole(r);
        const resource = keycloak.hasResourceRole(r);
        return realm || resource;
      });
    }
    return false;
  };

  const authorized = isAuthorized(roles);

  if (!keycloak.authenticated && initialized) {
    keycloak.login();
  }

  return (
    <Route
      {...rest}
      render={props => (keycloak.authenticated && authorized
        ? <Component {...props} />
        : <h1>Loading....</h1>)}
    />
  );
};

AuthRoute.propTypes = propTypes;

export default AuthRoute;
