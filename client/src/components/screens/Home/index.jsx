import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, Typography } from 'antd';
import intl from 'react-intl-universal';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import LoginForm from '../../forms/Login';
import { loginUser, recoverUser } from '../../../actions/user';
import { appShape } from '../../../reducers/app';

import './style.scss';


const HomeScreen = ({ app, actions }) => { // eslint-disable-line
  const { showLoadingAnimation } = app;
  const { Paragraph } = Typography;
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
          <img className="logo" alt={intl.get('header.title')} src="/assets/logos/cqgc-color.svg" />
          <Paragraph>
            Le Centre québécois de génomique clinique offre une plateforme clinique de séquençage à haut débit pour le diagnostic moléculaire des patients québécois en partenariat avec les huit laboratoires du Réseau de diagnostic moléculaire du Québec.
          </Paragraph>
          <div className="partenaire">
            <img height="42" alt="Centre hospitalier universitaire mère-enfant CHU Sainte-Justine" src="/assets/logos/chujs-color.svg" />
            <img height="75" alt="Centre hospitalier urbain de Montréal" src="/assets/chum.png" />
            <img height="40" alt="Hôpital général juif" src="/assets/logos/hgj.svg" />
            <img height="60" alt="CHU du Québec" src="/assets/chu.png" />
            <img height="30" alt="Institut de cardiologie de Montréal" src="/assets/icm.png" />
            <img height="45" alt="Centre hospitalier universitaire de Sherbrooke" src="/assets/chus.gif" />
            <img height="35" alt="Hôpital Maisonneuve-Rosemont" src="/assets/hmr.gif" />
            <img height="20" alt="Centre universitaire de santé McGill" src="/assets/logos/mcgill.svg" />
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
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    loginUser,
    recoverUser,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);
