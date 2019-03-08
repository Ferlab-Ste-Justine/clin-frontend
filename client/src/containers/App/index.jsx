import { hot } from 'react-hot-loader/root';
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import { Redirect } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IntlProvider } from 'react-intl-redux';
import { Spin, Layout, LocaleProvider } from 'antd';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import 'antd/dist/antd.less';
import './style.scss';

import PrivateRoute from '../PrivateRoute';
import HomeScreen from '../../components/screens/Home';
import ListScreen from '../../components/screens/List';
import SummaryScreen from '../../components/screens/Summary';
import NoMatchScreen from '../../components/screens/NoMatch';

import { loadApp } from '../../actions/app';
import { appShape } from '../../reducers/app';
import { userShape } from '../../reducers/user';

export class App extends React.Component {
  componentWillMount() {
    const { actions } = this.props;
    actions.loadApp();
  }

  render() {
    const {
      app, history, router, user,
    } = this.props;

    return (
      <Spin key="spinner" size="large" spinning={app.showLoadingAnimation}>
        <IntlProvider key="locale-intl">
          <LocaleProvider key="locale-antd" locale={app.locale.antd}>
            <TransitionGroup>
              <CSSTransition
                key={`transition-${router.location.key}`}
                timeout={{
                  enter: 300,
                  exit: 900,
                }}
                classNames={{
                  enter: 'animated fadeIn',
                  exit: 'animated fadeOut',
                }}
                mountOnEnter
                unmountOnExit
              >
                <Layout id="layout" key="layout">
                  <ConnectedRouter key="connected-router" history={history}>
                    <Switch key="switch">
                      <PrivateRoute exact path="/list" Component={ListScreen} key="route-list" />
                      <PrivateRoute path="/summary/:id" Component={SummaryScreen} key="route-summary" />
                      <Route
                        exact
                        path="/"
                        render={props => (
                          !user.username
                            ? <HomeScreen {...props} />
                            : <Redirect to="/list" />
                        )}
                        key="route-home"
                      />
                      <Route component={NoMatchScreen} key="route-nomatch" />
                    </Switch>
                  </ConnectedRouter>
                </Layout>
              </CSSTransition>
            </TransitionGroup>
          </LocaleProvider>
        </IntlProvider>
      </Spin>
    );
  }
}

App.defaultProps = {
  user: userShape,
};

App.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  app: PropTypes.shape(appShape).isRequired,
  user: PropTypes.shape(userShape),
  router: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  app: state.app,
  user: state.user,
  router: state.router,
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
