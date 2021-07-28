/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Tabs, Button, Spin, Badge, Card, Popover, Menu, Dropdown,
} from 'antd';
import { DownOutlined, MedicineBoxFilled } from '@ant-design/icons';

import IconKit from 'react-icons-kit';
import {
  ic_info_outline, ic_widgets, ic_cloud_download, ic_people,
} from 'react-icons-kit/md';
import PatientVariantScreen from '../PatientVariant';
import { appShape } from '../../../reducers/app';
import {
  navigateToPatientScreen,
  navigateToPatientVariantScreen,
  navigateToPatientSearchScreen,
  navigateToSubmissionWithPatient,
} from '../../../actions/router';

import { updateServiceRequestStatus } from '../../../actions/patient';

import '../../../style/themes/antd-clin-theme.css';
import './style.scss';
import Layout from '../../Layout';
import StatusChangeModal from './components/StatusChangeModal';
import PrescriptionsTab from './components/PrescriptionsTab';
import FilesTab from './components/FilesTab';
import PatientHeader from './components/PatientHeader';
import FamilyTab from './components/FamilyTab';

class PatientScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPrescriptionId: '',
    };
    this.handleNavigationToPatientScreen = this.handleNavigationToPatientScreen.bind(this);
    this.getRequest = this.getRequest.bind(this);
    this.handleNavigationToPatientSearchScreen = this.handleNavigationToPatientSearchScreen.bind(this);
    this.handleNavigationToPatientVariantScreen = this.handleNavigationToPatientVariantScreen.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.navigateToSubmissionWithPatient = this.navigateToSubmissionWithPatient.bind(this);
    this.handleOk = this.handleOk.bind(this);

    this.state.requestColumnPreset = [
      {
        key: 'date',
        label: 'screen.patient.details.submissionDate',
      },
      {
        key: 'requester',
        label: 'screen.patient.details.submittedBy',
      },
      {
        key: 'practitioner',
        label: 'screen.patient.details.practitioner',
      },
      {
        key: 'organization',
        label: 'screen.patient.details.organization',
      },
      {
        key: 'test',
        label: 'screen.patient.details.test',
      },
      {
        key: 'status',
        label: 'screen.patient.details.status',
      },
      {
        key: 'action',
        label: ' ',
      },
    ];

    this.state.familyHistoryColumnPreset = [
      {
        key: 'link',
        label: 'screen.patient.details.link',
      },
      {
        key: 'notes',
        label: 'screen.patient.details.notes',
      },
    ];

    this.state.clinicalColumnPreset = [
      {
        key: 'observed',
        label: 'screen.patient.details.observed',
      },
      {
        key: 'term',
        label: 'screen.patient.details.term',
      },
      {
        key: 'apparition',
        label: 'screen.patient.details.apparition',
      },
      {
        key: 'notes',
        label: 'screen.patient.details.notes',
      },
    ];
  }

  async handleOk(newStatus, note) {
    const { actions } = this.props;
    const { selectedPrescriptionId } = this.state;
    await actions.updateServiceRequestStatus(selectedPrescriptionId, newStatus, note);
    this.setState({ selectedPrescriptionId: '' });
  }

  getRequest() {
    const { prescriptions } = this.props;
    const { selectedPrescriptionId } = this.state;

    const requests = prescriptions.map((prescription) => ({
      status: prescription.status,
      date: prescription.date,
      requester: prescription.requester,
      practitioner: prescription.performer,
      organization: 'LDx CHU Ste-Justine',
      test: prescription.test,
      id: prescription.id,
    }));
    if (requests) {
      return requests.map((r) => {
        const getStatusColor = (status) => {
          switch (status) {
            case 'draft':
              return '#D2DBE4';
            case 'on-hold':
              return '#D46B08';
            case 'active':
              return '#1D8BC6';
            case 'revoked':
              return '#CF1322';
            case 'completed':
              return '#389E0D';
            case 'incomplete':
              return '#EB2F96';
              // empty rows
            case '':
              return 'transparent';
            default:
              return '#EB2F96';
          }
        };

        const status = <span><Badge className="impact" color={getStatusColor(r.status)} />{ intl.get(`screen.patient.details.status.${r.status}`) }</span>;
        const phonePart = r.requester.phone.split(' ');
        const phone = `(${phonePart[0]}) ${phonePart[1]}- ${phonePart[2]} `;
        const requesterPopOverText = (info) => (
          <Card title="Médecin prescripteur" bordered={false}>
            <p><span className="popOverName">{ info.formattedName }</span>  |  4425615</p>
            <p>{ info.organization }</p>
            <p>{ phone } poste: { info.phoneExtension }</p>
            <p><a href={`mailto:${info.email}`}>{ info.email }</a></p>
          </Card>
        );
        const requester = (
          <span className="logoText">
            { r.requester.formattedName }  |  4425615
            { r.requester.formattedName !== 'N/A' ? (
              <Popover overlayClassName="practitionerInfo" placement="topRight" content={requesterPopOverText(r.requester)} trigger="hover">
                <Button className="logoText__button" type="link"><IconKit size={16} icon={ic_info_outline} /></Button>
              </Popover>
            ) : null }

          </span>
        );

        const menu = (
          <Menu>
            <Menu.Item key="0">
              <Button type="link" className="dropDownButton" onClick={() => this.showModal(r.id)}>
                { intl.get('screen.patient.details.changeStatus') }
              </Button>
              <StatusChangeModal
                isVisible={selectedPrescriptionId === r.id}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
              />
            </Menu.Item>
            <Menu.Item key="1" disabled>
              { intl.get('screen.patient.details.seeDetails') }
            </Menu.Item>
          </Menu>
        );
        const action = (
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Button type="link" onClick={(e) => e.preventDefault()}>
              { intl.get('screen.patient.details.action') }
              <DownOutlined />
            </Button>
          </Dropdown>
        );
        return {
          date: r.date, requester, organization: r.organization, practitioner: requester, test: r.test, status, action,
        };
      });
    }
    return [];
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
          { patient != null && patient.id != null && patient.id.length > 0
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
  prescriptions: PropTypes.array.isRequired,
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
