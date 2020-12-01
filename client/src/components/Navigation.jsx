import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Row, Col, Tabs,
} from 'antd';

import { userShape } from '../reducers/user';
import { navigateToPatientSearchScreen, navigate } from '../actions/router';

const navigationMenu = (router, actions) => {
  const patientSearch = intl.get('navigation.main.searchPatient');
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
          actions.navigateToPatientSearchScreen(true);
        } else {
          actions.navigate(activeKey);
        }
      }}
    >
      <Tabs.TabPane tab={patientSearch} key="/patient/search" />
    </Tabs>
  );
};

const Navigation = ({
  user, router, actions,
}) => (
  <nav id="navigation">
    <Row type="flex">
      <Col span={24} align="start">
        { user.username !== null && navigationMenu(router, actions) }
      </Col>
    </Row>
  </nav>
);

Navigation.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  user: PropTypes.shape(userShape).isRequired,
  router: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    navigateToPatientSearchScreen,
    navigate,
  }, dispatch),
});

const mapStateToProps = (state) => ({
  user: state.user,
  router: state.router,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigation);
