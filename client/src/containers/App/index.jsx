import { hot } from 'react-hot-loader/root';
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IntlProvider } from 'react-intl-redux';
import { Spin, Layout, LocaleProvider } from 'antd';

import 'antd/dist/antd.less';
import './style.scss';

import PrivateRoute from '../PrivateRoute';
import HomeScreen from '../../components/screens/Home';
import PatientSearchScreen from '../../components/screens/PatientSearch';
import PatientScreen from '../../components/screens/Patient';
import PatientVariantScreen from '../../components/screens/PatientVariant';
import NoMatchScreen from '../../components/screens/NoMatch';

import { loadApp } from '../../actions/app';
import { appShape } from '../../reducers/app';

export class App extends React.Component {
  constructor() {
    super();

    const { actions } = this.props;
    actions.loadApp();
  }

  render() {
    const {
      app, history,
    } = this.props;

    return (
      <Spin key="spinner" size="large" spinning={app.showLoadingAnimation}>
        <IntlProvider key="locale-intl">
          <LocaleProvider key="locale-antd" locale={app.locale.antd}>
            <Layout id="layout" key="layout">
              <ConnectedRouter key="connected-router" history={history}>
                <Switch key="switch">
                  <PrivateRoute exact path="/patient/search" Component={PatientSearchScreen} key="route-patient-search" />
                  <PrivateRoute path="/patient/:uid/variant" Component={PatientVariantScreen} key="route-patient-variant" />
                  <PrivateRoute path="/patient/:uid" Component={PatientScreen} key="route-patient" />
                  <Route exact path="/" component={HomeScreen} key="route-home" />
                  <Route component={NoMatchScreen} key="route-nomatch" />
                </Switch>
              </ConnectedRouter>
            </Layout>
          </LocaleProvider>
        </IntlProvider>
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
