import React from 'react';
import { hot } from 'react-hot-loader/root';
import { connect } from 'react-redux';
import { ConfigProvider, Layout, Spin } from 'antd';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import { loadApp } from '../../actions/app';
import MaintenanceScreen from '../../components/screens/Maintenance';
import { appShape } from '../../reducers/app';
import AppRouter from '../AppRouter';

import 'style/themes/clin/dist/antd.css';
import './style.scss';

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
      return <MaintenanceScreen error={errorDetail} />;
    }

    const { app, history } = this.props;
    return (
      <Spin id="main-spinner" key="spinner" size="large" spinning={app.showLoadingAnimation}>
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

const mapStateToProps = (state) => ({
  app: state.app,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      loadApp,
    },
    dispatch,
  ),
});

export const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App);

export default hot(ConnectedApp);
