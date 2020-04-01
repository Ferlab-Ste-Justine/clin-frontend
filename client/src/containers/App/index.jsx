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

import HomeScreen from '../../components/screens/Home';
import MaintenanceScreen from '../../components/screens/Maintenance';
import NoMatchScreen from '../../components/screens/NoMatch';
import PatientScreen from '../../components/screens/Patient';
import PatientSearchScreen from '../../components/screens/PatientSearch';
import PatientVariantScreen from '../../components/screens/PatientVariant';
import VariantDetailsScreen from '../../components/screens/VariantDetails';
import PrivateRoute from '../PrivateRoute';
import {
  ROUTE_NAME_PATIENT, PATIENT_SUBROUTE_SEARCH, PATIENT_SUBROUTE_VARIANT, ROUTE_NAME_VARIANT,
} from '../../helpers/route';
import { loadApp, error, warning } from '../../actions/app';
import { appShape } from '../../reducers/app';

export class App extends React.Component {
  constructor() {
    super();
    this.state = { caughtError: false };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.loadApp();
  }

  // @TODO
  static getDerivedStateFromError() {
    return { caughtError: true };
  }

  componentDidCatch(e, info) {
    error(e.toString());
    warning(info);
  }

  render() {
    const { caughtError } = this.state;
    if (caughtError) {
      return (
        <MaintenanceScreen />
      );
    }

    // @NOTE In case we use intl for routes later on...
    const pathPatientSearch = `/${ROUTE_NAME_PATIENT}/${PATIENT_SUBROUTE_SEARCH}`;
    const pathPatientPage = `/${ROUTE_NAME_PATIENT}/:uid`;
    const pathPatientVariants = `/${ROUTE_NAME_PATIENT}/:uid/${PATIENT_SUBROUTE_VARIANT}`;
    const pathVariantPage = `/${ROUTE_NAME_VARIANT}/:uid`;

    // @NOTE test react route v4 regexp
    // const pathPatientSearch = `/(#\\/)${ROUTE_NAME_PATIENT}/${PATIENT_SUBROUTE_SEARCH}`;
    // const pathPatientPage = `/(#\\/)${ROUTE_NAME_PATIENT}/:uid`;
    // const pathPatientVariants = `/(#\\/)${ROUTE_NAME_PATIENT}/:uid/${PATIENT_SUBROUTE_VARIANT}`;
    // const pathVariantPage = `/(#\\/)${ROUTE_NAME_VARIANT}/:uid`;

    const { app, history } = this.props;
    return (
      <Spin key="spinner" size="large" spinning={app.showLoadingAnimation}>
        <ConfigProvider key="locale-antd" locale={app.locale.antd}>
          <Layout id="layout" key="layout">
            <ConnectedRouter key="connected-router" history={history}>
              <Switch key="switch">
                <Route exact path="/" component={HomeScreen} key="route-home" />
                <PrivateRoute exact path={pathPatientSearch} Component={PatientSearchScreen} key="route-patient-search" />
                <PrivateRoute exact path={pathPatientVariants} Component={PatientVariantScreen} key="route-patient-variant" />
                <PrivateRoute exact path={pathPatientPage} Component={PatientScreen} key="route-patient" />
                <PrivateRoute exact path={pathVariantPage} Component={VariantDetailsScreen} key="route-variant-details" />
                <Route component={NoMatchScreen} key="route-nomatch" />
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
