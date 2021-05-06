import { Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { useKeycloak } from '@react-keycloak/web';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import AuthRoute from './AuthRoute';
import PublicRoute from './PublicRoute';
import AccessDenied from '../components/screens/AccessDenied';
import PatientScreen from '../components/screens/Patient';
import PatientSearchScreen from '../components/screens/PatientSearch';
import PatientVariantScreen from '../components/screens/PatientVariant';
import VariantDetailsScreen from '../components/screens/VariantDetails';
import PatientSubmissionScreen from '../components/screens/PatientSubmission';
import {
  PATIENT_SUBROUTE_SEARCH,
  PATIENT_SUBROUTE_VARIANT,
  ROUTE_NAME_PATIENT,
  ROUTE_NAME_ROOT,
  ROUTE_NAME_VARIANT,
} from '../helpers/route';
import { getUserIdentity, getUserProfile, updateAuthPermissions } from '../actions/user';
import {
  KEYCLOAK_AUTH_RESOURCE_PATIENT_LIST,
  KEYCLOAK_AUTH_RESOURCE_PATIENT_PRESCRIPTIONS, KEYCLOAK_AUTH_RESOURCE_PATIENT_VARIANTS,
} from '../helpers/keycloak-api/utils';

const AppRouter = ({ history }) => {
  const { initialized, keycloak } = useKeycloak();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  keycloak.onAuthSuccess = () => {
    dispatch(getUserProfile());
    dispatch(getUserIdentity());
    dispatch(updateAuthPermissions());
  };

  if (!initialized) { return <div />; }

  if (!keycloak.authenticated) {
    keycloak.login();
  }

  if (user.permissions == null) { return <div />; }

  const pathRootPage = `${ROUTE_NAME_ROOT}`;
  const pathPatientSearch = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/${PATIENT_SUBROUTE_SEARCH}`;
  const pathPatientPage = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/:uid`;
  const pathPatientVariants = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/:uid/${PATIENT_SUBROUTE_VARIANT}`;
  const pathVariantPage = `${ROUTE_NAME_ROOT}${ROUTE_NAME_VARIANT}/:uid`;

  return (
    <ConnectedRouter key="connected-router" history={history}>
      <Switch key="switch">
        <PublicRoute Component={AccessDenied} path="/access-denied" key="route-access-denied" />
        <PublicRoute
          exact
          path={pathRootPage}
          component={() => (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
            }}
            >
              <Spin size="large" spinning />
            </div>
          )}
          key="route-loading"
        />
        <AuthRoute
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_LIST}
          roles={[]}
          path={pathPatientSearch}
          exact
          Component={PatientSearchScreen}
          key="route-patient-search"
        />
        <AuthRoute
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_VARIANTS}
          path={pathPatientVariants}
          exact
          Component={PatientVariantScreen}
          key="route-patient-variant"
        />
        <AuthRoute
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_PRESCRIPTIONS}
          path={pathPatientPage}
          exact
          Component={PatientScreen}
          key="route-patient"
        />
        <AuthRoute
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_VARIANTS}
          path={pathVariantPage}
          exact
          Component={VariantDetailsScreen}
          key="route-variant-details"
        />
        <AuthRoute
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_PRESCRIPTIONS}
          Component={PatientSubmissionScreen}
          key="route-patient-submission"
        />
      </Switch>
    </ConnectedRouter>
  );
};

AppRouter.propTypes = {
  history: PropTypes.shape({}).isRequired,
};

export default AppRouter;
