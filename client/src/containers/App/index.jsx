import { hot } from 'react-hot-loader/root';
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Spin, Layout, ConfigProvider } from 'antd';

import 'antd/dist/antd.less';
import './style.scss';

import AuthRoute from '../../components/Auth';
import MaintenanceScreen from '../../components/screens/Maintenance';
import AccessDenied from '../../components/screens/AccessDenied';
import PatientScreen from '../../components/screens/Patient';
import PatientSearchScreen from '../../components/screens/PatientSearch';
import PatientVariantScreen from '../../components/screens/PatientVariant';
import VariantDetailsScreen from '../../components/screens/VariantDetails';
import {
  ROUTE_NAME_ROOT, ROUTE_NAME_PATIENT, PATIENT_SUBROUTE_SEARCH, PATIENT_SUBROUTE_VARIANT, ROUTE_NAME_VARIANT,
} from '../../helpers/route';
import { loadApp } from '../../actions/app';
import { appShape } from '../../reducers/app';

export class App extends React.Component {
  constructor() {
    super();
    this.state = { caughtError: false, errorDetail: null };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.loadApp();
  }

  // @TODO
  static getDerivedStateFromError() {
    return { caughtError: true };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidCatch(e, info) {
    this.setState({ caughtError: true, errorDetail: e.toString() });
  }

  render() {
    const { caughtError, errorDetail } = this.state;
    if (caughtError) {
      return (
        <MaintenanceScreen error={errorDetail} />
      );
    }

    // @NOTE In case we use intl for routes later on...
    const pathRootPage = `${ROUTE_NAME_ROOT}`;
    const pathPatientSearch = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/${PATIENT_SUBROUTE_SEARCH}`;
    const pathPatientPage = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/:uid`;
    const pathPatientVariants = `${ROUTE_NAME_ROOT}${ROUTE_NAME_PATIENT}/:uid/${PATIENT_SUBROUTE_VARIANT}`;
    const pathVariantPage = `${ROUTE_NAME_ROOT}${ROUTE_NAME_VARIANT}/:uid`;

    const { app, history } = this.props;
    return (
      <Spin key="spinner" size="large" spinning={app.showLoadingAnimation}>
        <ConfigProvider key="locale-antd" locale={app.locale.antd}>
          <Layout id="layout" key="layout">
            <ConnectedRouter key="connected-router" history={history}>
              <Switch key="switch">
                <Route
                  exact
                  path={pathRootPage}
                  component={() => (
                    <div style={{
                      display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
                    }}
                    ><Spin size="large" spinning />
                    </div>
                  )}
                  key="route-loading"
                />
                <AuthRoute roles={['RealmAdmin']} path={pathPatientSearch} exact Component={PatientSearchScreen} key="route-patient-search" />
                <Route exact path={pathPatientVariants} Component={PatientVariantScreen} key="route-patient-variant" />
                <Route exact path={pathPatientPage} Component={PatientScreen} key="route-patient" />
                <Route exact path={pathVariantPage} Component={VariantDetailsScreen} key="route-variant-details" />
                <Route component={AccessDenied} key="route-access-denied" />
              </Switch>
            </ConnectedRouter>
          </Layout>
        </ConfigProvider>
      </Spin>
    );
  }
}

App.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  app: PropTypes.shape(appShape).isRequired,
  history: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  app: state.app,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    loadApp,
  }, dispatch),
});

export const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);

export default hot(ConnectedApp);
