import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { Spin } from 'antd';
import { ConnectedRouter } from 'connected-react-router';
import PropTypes from 'prop-types';

import { getUserIdentity, getUserProfile, updateAuthPermissions } from '../actions/user';
import AccessDenied from '../components/screens/AccessDenied';
import PatientScreen from '../components/screens/Patient';
import PatientSearchScreen from '../components/screens/PatientSearch';
import PatientsPrescriptionsSearch from '../components/screens/PatientsPrescriptionsSearch';
import PatientSubmissionScreen from '../components/screens/PatientSubmission';
import PatientVariantScreen from '../components/screens/PatientVariant';
import VariantDetailsScreen from '../components/screens/VariantDetails';
import {
  KEYCLOAK_AUTH_RESOURCE_PATIENT_LIST,
  KEYCLOAK_AUTH_RESOURCE_PATIENT_PRESCRIPTIONS, KEYCLOAK_AUTH_RESOURCE_PATIENT_VARIANTS,
} from '../helpers/keycloak-api/utils';
import {
  Routes,
} from '../helpers/route';

import AuthRoute from './AuthRoute';
import PublicRoute from './PublicRoute';

const AppRouter = ({ history }) => {
  const { initialized, keycloak } = useKeycloak();
  const dispatch = useDispatch();
  const user = useSelector((state)=> state.user);

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

  return (
    <ConnectedRouter history={history} key="connected-router">
      <Switch key="switch">
        <PublicRoute Component={AccessDenied} key="route-access-denied" path="/access-denied" />
        <PublicRoute
          Component={() => (
            <div style={{
              alignItems: 'center', display: 'flex', height: '100vh', justifyContent: 'center',
            }}
            >
              <Spin size="large" spinning />
            </div>
          )}
          exact
          key="route-loading"
          path={Routes.Root}
        />
        <AuthRoute
          Component={PatientSearchScreen}
          exact
          key="route-patient-search"
          path={Routes.PatientSearch}
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_LIST}
          roles={[]}
        />
        <AuthRoute
          Component={PatientsPrescriptionsSearch}
          exact
          key="route-patient-search"
          path={Routes.PatientSearchArranger}
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_LIST}
          roles={[]}
        />
        <AuthRoute
          Component={PatientVariantScreen}
          exact
          key="route-patient-variant"
          path={Routes.PatientVariants}
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_VARIANTS}
        />
        <AuthRoute
          Component={PatientScreen}
          exact
          key="route-patient"
          path={Routes.getPatientPath()}
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_PRESCRIPTIONS}
        />
        <AuthRoute
          Component={VariantDetailsScreen}
          exact
          key="route-variant-details"
          path={Routes.getVariantPath()}
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_VARIANTS}
        />
        <AuthRoute
          Component={PatientSubmissionScreen}
          key="route-patient-submission"
          resource={KEYCLOAK_AUTH_RESOURCE_PATIENT_PRESCRIPTIONS}
        />
      </Switch>
    </ConnectedRouter>
  );
};

AppRouter.propTypes = {
  history: PropTypes.shape({}).isRequired,
};

export default AppRouter;
