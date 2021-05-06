import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect, withRouter } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { useSelector } from 'react-redux';

const AuthRoute = ({
  Component, resource, ...rest
}) => {
  const { keycloak } = useKeycloak();
  const user = useSelector((state) => state.user);

  const isAuthorized = () => keycloak && user.permissions.includes(resource);

  return (
    <Route
      {...rest}
      render={(props) => (
        isAuthorized()
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
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(AuthRoute);
