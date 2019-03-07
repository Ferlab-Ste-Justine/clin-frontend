import { hot } from 'react-hot-loader/root';
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IntlProvider } from 'react-intl-redux';
import { Layout, LocaleProvider } from 'antd';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import 'antd/dist/antd.less';
import './style.scss';

import HomeScreen from '../../components/screens/Home';
import ListScreen from '../../components/screens/List';
import SummaryScreen from '../../components/screens/Summary';
import NoMatchScreen from '../../components/screens/NoMatch';

import { loadApp } from '../../actions/app';
import { appShapeShape } from '../../reducers/app';

export class App extends React.Component {
  componentWillMount() {
    const { actions } = this.props;
    actions.loadApp();
  }

  render() {
    const { app, history, router } = this.props;

    return (
      <IntlProvider key="locale-intl">
        <LocaleProvider key="locale-antd" locale={app.locale.antd}>
          <TransitionGroup>
            <CSSTransition
              key={router.location.key}
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
              <Layout id="layout">
                <ConnectedRouter key="router" history={history}>
                  <Switch location={router.location}>
                    <Route exact path="/" component={HomeScreen} />
                    <Route exact path="/list" component={ListScreen} />
                    <Route exact path="/summary" component={SummaryScreen} />
                    <Route component={NoMatchScreen} />
                  </Switch>
                </ConnectedRouter>
              </Layout>
            </CSSTransition>
          </TransitionGroup>
        </LocaleProvider>
      </IntlProvider>
    );
  }
}

App.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  app: PropTypes.shape(appShapeShape).isRequired,
  router: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  app: state.app,
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
