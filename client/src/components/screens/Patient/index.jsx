/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Col, Row, Tabs, Typography, Button, Spin, Tag, Badge, Card, Popover, Menu, Dropdown,
} from 'antd';
import { DownOutlined, MedicineBoxFilled } from '@ant-design/icons';

import IconKit from 'react-icons-kit';
import {
  ic_info_outline, ic_widgets,
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
    actions.navigateToPatientScreen(patient.id, tab);
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
      app, router, patient,
    } = this.props;
    const { showSubloadingAnimation } = app;
    const { hash } = router.location;

    const getGenderIcon = (gender) => {
      if (gender === 'female') {
        return (
          <i className="customIcon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2.25C11.4853 2.25 13.5 4.26472 13.5 6.75C13.5 8.9775 11.88 10.83 9.75 11.19V12.75H11.25V14.25H9.75V15.75H8.25V14.25H6.75V12.75H8.25V11.19C6.12 10.83 4.5 8.9775 4.5 6.75C4.5 4.26472 6.51472 2.25 9 2.25ZM9 3.75C7.34315 3.75 6 5.09315 6 6.75C6 8.40685 7.34315 9.75 9 9.75C10.6569 9.75 12 8.40685 12 6.75C12 5.09315 10.6569 3.75 9 3.75Z" fill="#A7B4C3" />
            </svg>
          </i>
        );
      }
      return (
        <i className="customIcon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.75 6.75C7.7175 6.75 8.625 7.0575 9.3525 7.5825L13.185 3.75H9.75V2.25H15.75V8.25H14.25V4.8075L10.4175 8.625C10.9425 9.375 11.25 10.275 11.25 11.25C11.25 13.7353 9.23528 15.75 6.75 15.75C4.26472 15.75 2.25 13.7353 2.25 11.25C2.25 8.76472 4.26472 6.75 6.75 6.75ZM6.75 8.25C5.09315 8.25 3.75 9.59315 3.75 11.25C3.75 12.9069 5.09315 14.25 6.75 14.25C8.40685 14.25 9.75 12.9069 9.75 11.25C9.75 9.59315 8.40685 8.25 6.75 8.25Z" fill="#A7B4C3" />
          </svg>
        </i>
      );
    };

    return (
      <Layout>
        <Spin spinning={showSubloadingAnimation}>
          { patient != null && patient.id != null && patient.id.length > 0
            && (
              <div className="patientPage">
                <div className="page_headerStaticNoMargin">
                  <div className="headerStaticContent">
                    <Row align="middle" className="flex-row patientHeader">
                      <Col>
                        <Typography.Title level={3} className="patientName">
                          { patient.lastName.toUpperCase() } { patient.firstName }
                        </Typography.Title>
                      </Col>
                      <Col>
                        { getGenderIcon(patient.gender) }
                      </Col>
                      <Col>
                        <Tag>
                          2012-10-18
                        </Tag>
                      </Col>
                      <Col>
                        <Tag color="red">{ patient.proband }</Tag>
                      </Col>
                    </Row>

                  </div>
                </div>
                <Tabs onChange={this.handleTabNavigation} defaultActiveKey={(hash ? hash.replace('#', '') : 'patient')} className="tabs staticTabs">
                  <Tabs.TabPane
                    key="prescriptions"
                    style={{ height: '100%' }}
                    tab={(
                      <span className="tabName">
                        <MedicineBoxFilled />
                        { intl.get('screen.patient.tab.prescriptions') }
                      </span>
                    )}
                  >
                    <PrescriptionsTab />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    key="variant"
                    tab={(
                      <span className="tabName">
                        <IconKit size={18} icon={ic_widgets} />
                        Variants
                      </span>
                    )}
                  >
                    <PatientVariantScreen />
                  </Tabs.TabPane>
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
  router: state.router,
  patient: state.patient.patient.parsed,
  prescriptions: state.patient.prescriptions?.map((prescription) => prescription.parsed) || [],
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientScreen);
