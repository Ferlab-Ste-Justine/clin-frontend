/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Col, Row, Tabs, Typography, Button, Spin, Table, Tag, Badge, Card, Collapse, Popover, Icon, Divider, Menu, Dropdown,
} from 'antd';
import {
  find,
  get,
} from 'lodash';


import IconKit from 'react-icons-kit';
import {
  ic_person, ic_assignment, ic_visibility, ic_visibility_off, ic_help, ic_perm_contact_calendar, ic_keyboard_arrow_down, ic_info_outline,
} from 'react-icons-kit/md';
import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import { appShape } from '../../../reducers/app';
import {
  navigateToPatientScreen, navigateToPatientVariantScreen,
  navigateToPatientSearchScreen,
} from '../../../actions/router';

import '../../../style/themes/antd-clin-theme.css';
import './style.scss';

const columnPresetToColumn = c => ({
  key: c.key, title: c.label, dataIndex: c.key,
});

class PatientScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.handleNavigationToPatientScreen = this.handleNavigationToPatientScreen.bind(this);
    this.getRequest = this.getRequest.bind(this);
    this.getExtendedlRequest = this.getExtendedlRequest.bind(this);
    this.getClinical = this.getClinical.bind(this);
    this.getIndication = this.getIndication.bind(this);
    this.getObservations = this.getObservations.bind(this);
    this.getHistorical = this.getHistorical.bind(this);
    this.handleNavigationToPatientSearchScreen = this.handleNavigationToPatientSearchScreen.bind(this);
    this.handleNavigationToPatientVariantScreen = this.handleNavigationToPatientVariantScreen.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);

    this.state.requestColumnPreset = [
      {
        key: 'date',
        label: 'Soumis le',
      },
      {
        key: 'requester',
        label: 'Soumis par',
      },
      {
        key: 'practitioner',
        label: 'Médecin résponsable',
      },
      {
        key: 'organization',
        label: 'Hôpital',
      },
      {
        key: 'test',
        label: 'Test',
      },
      {
        key: 'status',
        label: 'Statut',
      },
      {
        key: 'action',
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
        key: 'category',
        label: 'screen.patient.details.category',
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

  getRequest() {
    const { prescriptions } = this.props;

    const requests = prescriptions.map(prescription => ({
      status: prescription.status,
      date: prescription.date,
      requester: get(prescription, 'requester.name', 'N/A'),
      practitioner: get(prescription, 'performer.name', 'N/A'),
      organization: 'LDx CHU Ste-Justine',
      test: prescription.test,
    }));
    if (requests) {
      return requests.map((r) => {
        const getStatusColor = (status) => {
          switch (status) {
            case 'draft':
              // Gray-5
              return '#D2DBE4';
            case 'on-hold':
              return '#FA8C16';
            case 'active':
              // blue-6
              return '#2AABE8';
            case 'revoked':
              return '#F5222D';
            case 'completed':
              return '#52C41A';
            default:
              return '#EB2F96';
          }
        };
        const status = <span><Badge className="impact" color={getStatusColor(r.status)} />{r.status}</span>;

        const practitionerPopOverText = info => (
          <Card title="Médecin résponsable" bordered={false}>
            <p><span className="popOverName">{info}</span>  |  4425615</p>
            <p>CHU Sainte Justine</p>
            <p>(514) 456-367 poste: 3542</p>
            <p><a href="mailto:webmaster@example.com">julie.doucet@chu-ste-justine.qc.ca</a></p>
          </Card>
        );
        const requesterPopOverText = info => (
          <Card title="Médecin prescripteur" bordered={false}>
            <p><span className="popOverName">{info}</span>  |  4425615</p>
            <p>CHU Sainte Justine</p>
            <p>(514) 456-367 poste: 3542</p>
            <p><a href="mailto:webmaster@example.com">julie.doucet@chu-ste-justine.qc.ca</a></p>
          </Card>
        );
        const practitioner = (
          <span className="logoText">
            {r.practitioner}
            <Popover overlayClassName="practitionerInfo" placement="topRight" content={practitionerPopOverText(r.practitioner)} trigger="hover">
              <Button type="link"><IconKit size={16} icon={ic_info_outline} /></Button>
            </Popover>
          </span>
        );
        const requester = (
          <span className="logoText">
            {r.requester}
            <Popover overlayClassName="practitionerInfo" placement="topRight" content={requesterPopOverText(r.requester)} trigger="hover">
              <Button type="link"><IconKit size={16} icon={ic_info_outline} /></Button>
            </Popover>
          </span>
        );

        const menu = (
          <Menu>
            <Menu.Item key="0">
                Changer le statut
            </Menu.Item>
            <Menu.Item key="1" disabled>
                Voir détail
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="3" disabled>
              Supprimer
            </Menu.Item>
          </Menu>
        );
        const action = (
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Button type="link" onClick={e => e.preventDefault()}>
              Action <IconKit size={12} icon={ic_keyboard_arrow_down} />
            </Button>
          </Dropdown>
        );
        return {
          date: r.date, requester, organization: r.organization, practitioner, test: r.test, status, action,
        };
      });
    }
    return [];
  }

  getFamilyHistory() {
    const { patient } = this.props;
    const { familyHistory } = patient;
    if (familyHistory) {
      return familyHistory.map(f => ({
        link: f.note, notes: f.date,
      }));
    }
    return [];
  }

  getExtendedlRequest() {
    const { patient } = this.props;
    const { requests, samples } = patient;

    if (requests) {
      return requests.map((r) => {
        const sample = find(samples, { request: r.id });
        return {
          specimen: r.specimen, externalId: sample ? sample.barcode : '--', type: sample.type, specimenIdExt: '', sourceTissue: '', tissueType: '',
        };
      });
    }

    return [];
  }

  getClinical() {
    const { patient } = this.props;
    const { ontology } = patient;

    if (ontology) {
      return ontology.map((o) => {
        const getObservedIcon = (status) => {
          if (status === 'POS') {
            return (<IconKit className="observedIcon icon" size={16} icon={ic_visibility} />);
          }
          if (status === 'NEG') {
            return (<IconKit className="notObservedIcon icon" size={16} icon={ic_visibility_off} />);
          }

          return (<IconKit className="unknownIcon icon" size={16} icon={ic_help} />);
        };
        const observed = getObservedIcon(o.observed);
        const note = o.note ? o.note : '--';
        const dateA = o.apparition_date.split('T');
        return {
          observed, category: o.term, term: o.term, apparition: dateA[0], notes: note,
        };
      });
    }

    return [];
  }

  getIndication() {
    const { patient } = this.props;
    const { indications } = patient;
    if (indications) {
      return indications.map((i) => {
        const date = i.consultation_date.split('T');
        return {
          notes: i.note, consultation: date[0],
        };
      });
    }
    return [];
  }

  getObservations() {
    const { patient } = this.props;
    const { observations } = patient;
    if (observations) {
      return observations.map((o) => {
        const date = o.consultation_date.split('T');
        return {
          notes: o.note, consultation: date[0],
        };
      });
    }
    return [];
  }

  getHistorical() {
    const { patient } = this.props;
    const { familyHistory } = patient;
    if (familyHistory) {
      return familyHistory.map((f) => {
        const date = f.date.split('T')[0];
        return {
          notes: f.note, date,
        };
      });
    }
    return [];
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

  render() {
    const {
      app, router, patient,
    } = this.props;
    const {
      requestColumnPreset, familyHistoryColumnPreset, clinicalColumnPreset,
    } = this.state;
    const { showSubloadingAnimation } = app;
    const { hash } = router.location;
    const mrn = intl.get('screen.patient.details.mrn');
    const ramq = intl.get('screen.patient.details.ramq');
    const dateOfBirth = intl.get('screen.patient.details.dob');
    const genderTitle = intl.get('screen.patient.details.gender');
    const ethnicity = intl.get('screen.patient.details.ethnicity');
    const consanguinity = intl.get('screen.patient.details.consanguinity');
    /*     const mother = intl.get('screen.patient.details.mother');
    const father = intl.get('screen.patient.details.father');
    const additionalInformation = intl.get('screen.patient.header.additionalInformation'); */
    const family = intl.get('screen.patient.header.family');
    const patientTab = intl.get('screen.patient.tab.patient');
    const clinicalTab = intl.get('screen.patient.tab.clinical');
    const familyType = intl.get('screen.patient.details.familyType');

    const { Panel } = Collapse;
    const familyTypeTag = <Tag color="cyan" className="familyTypeTag">Trio</Tag>;

    // ICON GENDER
    const maleIcon = (
      <i className="customIcon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.75 6.75C7.7175 6.75 8.625 7.0575 9.3525 7.5825L13.185 3.75H9.75V2.25H15.75V8.25H14.25V4.8075L10.4175 8.625C10.9425 9.375 11.25 10.275 11.25 11.25C11.25 13.7353 9.23528 15.75 6.75 15.75C4.26472 15.75 2.25 13.7353 2.25 11.25C2.25 8.76472 4.26472 6.75 6.75 6.75ZM6.75 8.25C5.09315 8.25 3.75 9.59315 3.75 11.25C3.75 12.9069 5.09315 14.25 6.75 14.25C8.40685 14.25 9.75 12.9069 9.75 11.25C9.75 9.59315 8.40685 8.25 6.75 8.25Z" fill="#A7B4C3" />
        </svg>
      </i>
    );
    // eslint-disable-next-line no-unused-vars
    const femaleIcon = (
      <i className="customIcon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 2.25C11.4853 2.25 13.5 4.26472 13.5 6.75C13.5 8.9775 11.88 10.83 9.75 11.19V12.75H11.25V14.25H9.75V15.75H8.25V14.25H6.75V12.75H8.25V11.19C6.12 10.83 4.5 8.9775 4.5 6.75C4.5 4.26472 6.51472 2.25 9 2.25ZM9 3.75C7.34315 3.75 6 5.09315 6 6.75C6 8.40685 7.34315 9.75 9 9.75C10.6569 9.75 12 8.40685 12 6.75C12 5.09315 10.6569 3.75 9 3.75Z" fill="#A7B4C3" />
        </svg>
      </i>
    );

    return (
      <Content type="auto">
        <Header />
        <Spin spinning={showSubloadingAnimation}>
          {patient != null
           && (
           <div className="patientPage">
             <div className="page_headerStaticNoMargin">
               <div className="headerStaticContent">
                 <Row type="flex" align="middle" className="patientHeader">
                   <Col>
                     <Typography.Title level={3} className="patientName">
                       {patient.lastName} {patient.firstName}
                     </Typography.Title>
                   </Col>
                   <Col>
                     {maleIcon}
                   </Col>
                   <Col>
                     <Tag>
                     2012-10-18
                     </Tag>
                   </Col>
                   <Col>
                     <Tag color="red">{patient.proband}</Tag>
                   </Col>


                   <Col>
                     <a href="#" data-patient-id={patient.id} onClick={this.handleNavigationToPatientVariantScreen}>
                       <Button type="primary">
                 Variant Interpreter
                       </Button>
                     </a>
                   </Col>
                 </Row>


               </div>
             </div>
             <Tabs onChange={this.handleTabNavigation} defaultActiveKey={(hash ? hash.replace('#', '') : 'patient')} className="tabs staticTabs">
               <Tabs.TabPane
                 key="personal"
                 style={{ height: '100%' }}
                 tab={(
                   <span className="tabName">
                     <IconKit size={18} icon={ic_person} />
                     {patientTab}
                   </span>
             )}
               >
                 <div className="page-static-content">
                   <Card bordered={false} className="generalInfo">
                     <Row type="flex">
                       <Col>
                         <Card className="nameBlock">
                           <Row align="middle" justify="center">
                             <IconKit size={56} icon={ic_perm_contact_calendar} />
                             <Col><Typography.Title level={3} className="patientName">{patient.lastName}</Typography.Title></Col>
                             <Col><Typography.Title level={4} className="patientName">{patient.firstName}</Typography.Title></Col>
                             <Col><Tag color="red">{patient.proband}</Tag></Col>
                           </Row>
                         </Card>
                       </Col>
                       <Col className="content">
                         <Row type="flex">
                           <Col className="grid">
                             <div className="row">
                               <span className="title">{ramq}</span>
                               <span className="info">{patient.ramq}</span>
                             </div>
                             <div className="row">
                               <span className="title">{genderTitle}</span>
                               <span className="info">{patient.gender}</span>
                             </div>
                             <div className="row">
                               <span className="title">{mrn}</span>
                               <span className="info mrn">{patient.mrn} | {patient.organization}</span>
                               {/*                               <span className="info mrn">156987 | CHUSJ</span>
                             <span className="info mrn">789654 | HGM</span>
                             <span className="view">Voir moins</span> */}
                             </div>
                             <div className="row">
                               <span className="title">{dateOfBirth}</span>
                               <span className="info">{patient.birthDate}</span>
                             </div>
                           </Col>
                           <Divider type="vertical" />
                           <Col className="grid">
                             <div className="row">
                               <span className="title">{ethnicity}</span>
                               <span className="info">{patient.ethnicity}</span>
                             </div>
                             <div className="row">
                               <span className="title">{family}</span>
                               <span className="info"><Button type="link">{patient.familyId}</Button></span>
                             </div>
                             <div className="row">
                               <span className="title">{consanguinity}</span>
                               <span className="info">{patient.bloodRelationship}</span>
                             </div>
                             <div className="row">
                               <span className="title">{familyType}</span>
                               <span className="info">{familyTypeTag}</span>
                             </div>
                           </Col>
                         </Row>
                       </Col>
                     </Row>
                   </Card>
                   <Row>
                     <Card bordered={false} className="prescription">
                       <Card title="Prescriptions" bordered={false}>
                         <Table
                           pagination={false}
                           columns={requestColumnPreset.map(
                             columnPresetToColumn,
                           )}
                           dataSource={this.getRequest()}
                           size="small"
                         />
                       </Card>

                     </Card>
                   </Row>
                 </div>
               </Tabs.TabPane>

               <Tabs.TabPane
                 key="clinical"
                 tab={(
                   <span className="tabName">
                     <IconKit size={18} icon={ic_assignment} />
                     {clinicalTab}
                   </span>
             )}
                 style={{ height: '100%' }}
               >
                 <div className="page-static-content">
                   <Card bordered={false} className="staticCard">
                     <Collapse bordered={false} defaultActiveKey={['1']} expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}>
                       <Panel header="Consultation 2020-06-05" key="1">
                         <Card className="generalInfo" bordered={false} staticCard>
                           <Row type="flex" justify="space-between" gutter={[12, 24]}>
                             <Col className="title">Medicin Référant</Col>
                             <Col className="value">Dre Julie DOUCET</Col>
                           </Row>
                           <Row type="flex" justify="space-between" gutter={[12, 24]}>
                             <Col className="title">Age du patient</Col>
                             <Col className="value">3 ans</Col>
                           </Row>
                           <Row type="flex" justify="space-between" gutter={[12, 24]}>
                             <Col className="title">CGH</Col>
                             <Col className="value neg">Négatif</Col>
                           </Row>
                           <Row type="flex" justify="space-between" gutter={[12, 24]}>
                             <Col className="title">Résume de l'investigation</Col>
                             <Col className="value">Echographie anormale a 3 mois teste neurologique realise le 2019-03-06</Col>
                           </Row>
                           <Row type="flex" justify="space-between" gutter={[12, 24]}>
                             <Col className="title">Hypothèse de diagnostique</Col>
                             <Col className="value">Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</Col>
                           </Row>
                         </Card>
                         <Card title="Histoire familiale" bordered={false} className="staticCard">
                           <Table
                             pagination={false}
                             columns={familyHistoryColumnPreset.map(
                               columnPresetToColumn,
                             )}
                             dataSource={this.getFamilyHistory()}
                             size="small"
                           />
                         </Card>

                         <Card title="Signes cliniques" bordered={false} className="staticCard">
                           <Table
                             pagination={false}
                             columns={clinicalColumnPreset.map(
                               columnPresetToColumn,
                             )}
                             dataSource={this.getClinical()}
                             size="small"
                           />
                         </Card>
                       </Panel>
                     </Collapse>
                   </Card>

                 </div>
               </Tabs.TabPane>
             </Tabs>
           </div>
           )}
          <Footer />
        </Spin>

      </Content>
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

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    navigateToPatientScreen,
    navigateToPatientVariantScreen,
    navigateToPatientSearchScreen,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  router: state.router,
  patient: state.patient.patient.parsed,
  prescriptions: state.patient.prescriptions.map(prescription => prescription.parsed),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientScreen);
