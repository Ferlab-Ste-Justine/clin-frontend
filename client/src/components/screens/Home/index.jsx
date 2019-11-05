import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, Typography } from 'antd';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import LoginForm from '../../forms/Login';
import { loginUser, recoverUser } from '../../../actions/user';
import { appShape } from '../../../reducers/app';

import './style.scss';


const HomeScreen = ({ app, intl, actions }) => { // eslint-disable-line
  const { showLoadingAnimation } = app;
  const { Paragraph } = Typography;
  window.CLIN.translate = intl.formatMessage;
  const title = intl.formatMessage({ id: 'header.title' });
  return (
    <Content>
      <Header />
      <Card className="centered">
        <LoginForm
          appIsLoading={showLoadingAnimation}
          handleAuthentication={actions.loginUser}
          handlePasswordRecovery={actions.recoverUser}
        />
        <div className="content">
          <img className="logo" alt={title} src="/images/logo_CQGC_couleur.svg" />
          <Paragraph>
            Le Centre québécois de génomique clinique offre une plateforme clinique de séquençage à haut débit pour le diagnostic moléculaire des patients québécois en partenariat avec les huit laboratoires du Réseau de diagnostic moléculaire du Québec.
          </Paragraph>
          <div className="partenaire">
            <img height="25" alt="Centre universitaire de santé McGill" src="/images/mcgill.gif" />
            <img height="45" alt="Centre hospitalier urbain de Montréal" src="/images/chum.png" />
            <img height="45" alt="Hôpital général juif" src="/images/hgj.png" />
            <img height="42" alt="CHU du Québec" src="/images/chu.png" />
            <img height="40" alt="Hôpital Maisonneuve-Rosemont" src="/images/hmr.gif" />
            <img height="35" alt="Institut de cardiologie de Montréal" src="/images/icm.png" />
            <img height="50" alt="Centre hospitalier universitaire de Sherbrooke" src="/images/chus.gif" />
          </div>
        </div>
      </Card>
      <Footer />
    </Content>
  );
};

HomeScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  app: PropTypes.shape(appShape).isRequired,
  intl: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    loginUser,
    recoverUser,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  intl: state.intl,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(HomeScreen));
