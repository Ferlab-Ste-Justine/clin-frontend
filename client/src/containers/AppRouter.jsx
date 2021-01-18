import { Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { useKeycloak } from '@react-keycloak/web';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
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
  ROUTE_NAME_ROOT, ROUTE_NAME_SUBMISSION,
  ROUTE_NAME_VARIANT,
} from '../helpers/route';

const AppRouter = ({ history }) => {
  const { initialized } = useKeycloak();

  if (!initialized) {
    return <div />;
  }

  // @NOTE In case we use intl for routes later on...
  const pathRootPage = `${ROUTE_NAME_ROOT}`;
  const pathPatientSearch = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/${PATIENT_SUBROUTE_SEARCH}`;
  const pathPatientPage = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/:uid`;
  const pathPatientVariants = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/:uid/${PATIENT_SUBROUTE_VARIANT}`;
  const pathVariantPage = `${ROUTE_NAME_ROOT}${ROUTE_NAME_VARIANT}/:uid`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pathSubmissionPage = `${ROUTE_NAME_ROOT}${ROUTE_NAME_SUBMISSION}/:uid`;

  return (
    <ConnectedRouter key="connected-router" history={history}>
      <Switch key="switch">
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
        <AuthRoute roles={[]} path={pathPatientSearch} exact Component={PatientSearchScreen} key="route-patient-search" />
        <AuthRoute roles={[]} path={pathPatientVariants} exact Component={PatientVariantScreen} key="route-patient-variant" />
        <AuthRoute roles={[]} path={pathPatientPage} exact Component={PatientScreen} key="route-patient" />
        <AuthRoute roles={[]} path={pathVariantPage} exact Component={VariantDetailsScreen} key="route-variant-details" />
        <AuthRoute roles={[]} Component={PatientSubmissionScreen} key="route-patient-submission" />
        <PublicRoute component={AccessDenied} key="route-access-denied" />
      </Switch>
    </ConnectedRouter>
  );
};

AppRouter.propTypes = {
  history: PropTypes.shape({}).isRequired,
};

export default AppRouter;
