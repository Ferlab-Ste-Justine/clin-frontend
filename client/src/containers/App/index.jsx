import '../../style/themes/antd-clin-theme.less';
import { hot } from 'react-hot-loader/root';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Spin, Layout, ConfigProvider } from 'antd';


import './style.scss';

import MaintenanceScreen from '../../components/screens/Maintenance';

import { loadApp } from '../../actions/app';
import { appShape } from '../../reducers/app';
import AppRouter from '../AppRouter';


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

  render() {
    const { caughtError, errorDetail } = this.state;
    if (caughtError) {
      return (
        <MaintenanceScreen error={errorDetail} />
      );
    }

    const { app, history } = this.props;
    return (
      <Spin key="spinner" size="large" spinning={app.showLoadingAnimation}>
        <ConfigProvider key="locale-antd" locale={app.locale.antd}>
          <Layout id="layout" key="layout">
            <AppRouter app={app} history={history} />
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
