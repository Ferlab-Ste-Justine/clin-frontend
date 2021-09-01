import React from 'react';
import IconKit from 'react-icons-kit';
import { ic_cloud_download, ic_people, ic_widgets } from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { MedicineBoxFilled } from '@ant-design/icons';
import { updateServiceRequestStatus } from 'actions/patient';
import {
  navigateToPatientScreen,
  navigateToPatientSearchScreen,
  navigateToPatientVariantScreen,
  navigateToSubmissionWithPatient,
} from 'actions/router';
import { Spin, Tabs } from 'antd';
import keycloak from 'keycloak';
import PropTypes from 'prop-types';
import { appShape } from 'reducers/app';
import { bindActionCreators } from 'redux';

import ApolloProvider from 'store/providers/apollo';

import Layout from '../../Layout';
import PatientVariantScreen from '../PatientVariant';

import FamilyTab from './components/FamilyTab';
import FilesTab from './components/FilesTab';
import PatientHeader from './components/PatientHeader';
import PrescriptionsTab from './components/PrescriptionsTab';

import 'style/themes/clin/dist/antd.css';
import './style.scss';

class PatientScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPrescriptionId: '',
    };
    this.handleNavigationToPatientScreen = this.handleNavigationToPatientScreen.bind(this);
    this.handleNavigationToPatientSearchScreen =
      this.handleNavigationToPatientSearchScreen.bind(this);
    this.handleNavigationToPatientVariantScreen =
      this.handleNavigationToPatientVariantScreen.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.navigateToSubmissionWithPatient = this.navigateToSubmissionWithPatient.bind(this);
    this.handleOk = this.handleOk.bind(this);
  }

  async handleOk(newStatus, note) {
    const { actions } = this.props;
    const { selectedPrescriptionId } = this.state;
    await actions.updateServiceRequestStatus(selectedPrescriptionId, newStatus, note);
    this.setState({ selectedPrescriptionId: '' });
  }

  navigateToSubmissionWithPatient() {
    const { actions } = this.props;
    actions.navigateToSubmissionWithPatient();
  }

  handleNavigationToPatientScreen(e) {
    const { actions } = this.props;
    actions.navigateToPatientScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
  }

  handleNavigationToPatientVariantScreen(e) {
    const { actions } = this.props;
    actions.navigateToPatientVariantScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
  }

  handleNavigationToPatientSearchScreen() {
    const { actions } = this.props;
    actions.navigateToPatientSearchScreen(false);
  }

  handleTabNavigation(tab) {
    const { actions, patient } = this.props;
    actions.navigateToPatientScreen(patient.id, { tab });
  }

  showModal(id) {
    this.setState({
      selectedPrescriptionId: id,
    });
  }

  handleCancel() {
    this.setState({
      selectedPrescriptionId: '',
    });
  }

  render() {
    const { app, currentActiveKey, patient } = this.props;
    const { showSubloadingAnimation } = app;

    if (showSubloadingAnimation) {
      return (
        <Layout>
          <div className="spinContainer">
            <Spin spinning />
          </div>
        </Layout>
      );
    }

    const tabs = [
      {
        content: <PrescriptionsTab />,
        name: 'prescriptions',
        title: (
          <span className="tabName">
            <MedicineBoxFilled />
            {intl.get('screen.patient.tab.prescriptions')}
          </span>
        ),
      },
      {
        content: <FamilyTab />,
        name: 'family',
        title: (
          <span className="tabName">
            <IconKit icon={ic_people} size={18} />
            {intl.get('screen.patient.tab.family')}
          </span>
        ),
      },
      {
        content: <PatientVariantScreen />,
        name: 'variant',
        title: (
          <span className="tabName">
            <IconKit icon={ic_widgets} size={18} />
            Variants
          </span>
        ),
      },
      {
        // FixMe
        content: <ApolloProvider userToken={keycloak.token}><FilesTab /></ApolloProvider>,
        name: 'files',
        title: (
          <span className="tabName">
            <IconKit icon={ic_cloud_download} size={18} />
            Fichiers
          </span>
        ),
      },
    ];

    return (
      <Layout>
        {patient?.id && patient.id.length > 0 && (
          <div className="patient-page">
            <div className="page_headerStaticNoMargin">
              <PatientHeader patient={patient} />
            </div>
            <Tabs
              activeKey={currentActiveKey}
              className="patient-page__tabs staticTabs"
              onChange={this.handleTabNavigation}
            >
              {tabs.map((tab) => (
                <Tabs.TabPane key={tab.name} style={{ height: '100%' }} tab={tab.title}>
                  {tab.content}
                </Tabs.TabPane>
              ))}
            </Tabs>
          </div>
        )}
      </Layout>
    );
  }
}

PatientScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  app: PropTypes.shape(appShape).isRequired,
  patient: PropTypes.shape({}).isRequired,
  router: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      navigateToPatientScreen,
      navigateToPatientSearchScreen,
      navigateToPatientVariantScreen,
      navigateToSubmissionWithPatient,
      updateServiceRequestStatus,
    },
    dispatch,
  ),
});

const mapStateToProps = (state) => ({
  app: state.app,
  currentActiveKey: state.patient.currentActiveKey,
  patient: state.patient.patient.parsed,
  prescriptions: state.patient.prescriptions?.map((prescription) => prescription.parsed) || [],
});

export default connect(mapStateToProps, mapDispatchToProps)(PatientScreen);
