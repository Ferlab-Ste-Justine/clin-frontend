/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import IconKit from 'react-icons-kit';
import { ic_cloud_download, ic_people, ic_widgets } from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { MedicineBoxFilled } from '@ant-design/icons';
import { Spin, Tabs } from 'antd';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import { updateServiceRequestStatus } from '../../../actions/patient';
import {
  navigateToPatientScreen,
  navigateToPatientSearchScreen,
  navigateToPatientVariantScreen,
  navigateToSubmissionWithPatient,
} from '../../../actions/router';
import { appShape } from '../../../reducers/app';
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
    this.handleNavigationToPatientSearchScreen = this.handleNavigationToPatientSearchScreen.bind(this);
    this.handleNavigationToPatientVariantScreen = this.handleNavigationToPatientVariantScreen.bind(this);
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
    const {
      app, patient, currentActiveKey,
    } = this.props;
    const { showSubloadingAnimation } = app;

    const tabs = [
      {
        name: 'prescriptions',
        title: (
          <span className="tabName">
            <MedicineBoxFilled />
            { intl.get('screen.patient.tab.prescriptions') }
          </span>),
        content: <PrescriptionsTab />,
      },
      {
        name: 'family',
        title: (
          <span className="tabName">
            <IconKit size={18} icon={ic_people} />
            { intl.get('screen.patient.tab.family') }
          </span>),
        content: <FamilyTab />,
      },
      {
        name: 'variant',
        title: (
          <span className="tabName">
            <IconKit size={18} icon={ic_widgets} />
            Variants
          </span>
        ),
        content: <PatientVariantScreen />,
      },
      {
        name: 'files',
        title: (
          <span className="tabName">
            <IconKit size={18} icon={ic_cloud_download} />
            Fichiers
          </span>
        ),
        content: <FilesTab />,
      },
    ];

    return (
      <Layout>
        <Spin spinning={showSubloadingAnimation}>
          { patient?.id && patient.id.length > 0
          && (
            <div className="patient-page">
              <div className="page_headerStaticNoMargin">
                <PatientHeader patient={patient} />
              </div>
              <Tabs
                onChange={this.handleTabNavigation}
                className="patient-page__tabs staticTabs"
                activeKey={currentActiveKey}
              >
                {
                  tabs.map((tab) => (
                    <Tabs.TabPane
                      key={tab.name}
                      style={{ height: '100%' }}
                      tab={tab.title}
                    >
                      { tab.content }
                    </Tabs.TabPane>
                  ))
                }
              </Tabs>
            </div>
          ) }
        </Spin>
      </Layout>
    );
  }
}

PatientScreen.propTypes = {
  app: PropTypes.shape(appShape).isRequired,
  router: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape({}).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    navigateToPatientScreen,
    navigateToPatientVariantScreen,
    navigateToPatientSearchScreen,
    navigateToSubmissionWithPatient,
    updateServiceRequestStatus,
  }, dispatch),
});

const mapStateToProps = (state) => ({
  app: state.app,
  patient: state.patient.patient.parsed,
  prescriptions: state.patient.prescriptions?.map((prescription) => prescription.parsed) || [],
  currentActiveKey: state.patient.currentActiveKey,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientScreen);
