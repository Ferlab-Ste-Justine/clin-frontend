import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Row, Col, Tabs,
} from 'antd';

import { userShape } from '../reducers/user';
import { navigateToPatientSearchScreen, navigate } from '../actions/router';


// onClick={navigateToPatientSearchScreen}
const navigationMenu = (intl, router, actions) => {
  const patientSearch = intl.formatMessage({ id: 'navigation.main.searchPatient' });
  let tabForRoute = router.location.pathname;
  if (tabForRoute.indexOf('/patient/') !== -1) {
    tabForRoute = '/patient/search';
  }
  return (
    <Tabs
      type="card"
      activeKey={tabForRoute}
      onChange={(activeKey) => {
        if (activeKey === '/patient/search') {
          actions.navigateToPatientSearchScreen();
        } else {
          actions.navigate(activeKey);
        }
      }}
    >
      <Tabs.TabPane tab={patientSearch} key="/patient/search" />
      { /* <Tabs.TabPane tab="Recherche de Variants" key="/variant/search" /> */ }
    </Tabs>
  );
};

const Navigation = ({
  intl, user, router, actions,
}) => (
  <nav id="navigation">
    <Row type="flex">
      <Col span={24} align="start">
        { user.username !== null && navigationMenu(intl, router, actions)}
      </Col>
    </Row>
  </nav>
);

Navigation.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  intl: PropTypes.shape({}).isRequired,
  user: PropTypes.shape(userShape).isRequired,
  router: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    navigateToPatientSearchScreen,
    navigate,
  }, dispatch),
});

const mapStateToProps = state => ({
  intl: state.intl,
  user: state.user,
  router: state.router,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(Navigation));
