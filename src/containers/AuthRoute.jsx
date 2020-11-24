import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect, withRouter } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const AuthRoute = ({ Component, roles, ...rest }) => {
  const [keycloak] = useKeycloak();

  const isAuthorized = (requiredRoles) => {
    // We check if Keycloak is initialized in the AppRouter.jsx, thus no need to test it here.
    if (keycloak && !keycloak.authenticated) {
      keycloak.login();
    }

    if (!requiredRoles || requiredRoles.length === 0) {
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
      render={(props) => (
        isAuthorized(roles)
          ? <Component {...props} />
          : (
            <Redirect
              to={{
                pathname: '/access-denied',
                state: { from: props.location.pathname },
              }}
            />
          )
      )}
    />
  );
};

AuthRoute.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.func]).isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(AuthRoute);
