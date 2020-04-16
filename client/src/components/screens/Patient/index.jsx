import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Col, Row, Tabs, PageHeader, Typography, Button, Spin, Table, Empty, Tag,
} from 'antd';

import IconKit from 'react-icons-kit';
import {
  ic_person, ic_assignment, ic_done, ic_close,
} from 'react-icons-kit/md';
import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';
import { patientShape } from '../../../reducers/patient';
import { appShape } from '../../../reducers/app';
import {
  navigateToPatientScreen, navigateToPatientVariantScreen,
  navigateToPatientSearchScreen,
} from '../../../actions/router';

import './style.scss';

const columnPresetToColumn = c => ({
  key: c.key, title: intl.get(c.label), dataIndex: c.key,
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
    this.handleNavigationToPatientSearchScreen = this.handleNavigationToPatientSearchScreen.bind(this);
    this.handleNavigationToPatientVariantScreen = this.handleNavigationToPatientVariantScreen.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);

    this.state.requestColumnPreset = [
      {
        key: 'id',
        label: 'screen.patient.details.id',
      },
      {
        key: 'date',
        label: 'screen.patient.details.date',
      },
      {
        key: 'requester',
        label: 'screen.patient.details.author',
      },
      {
        key: 'labo',
        label: 'screen.patient.details.labo',
      },
    ];

    this.state.extendRequestColumnPreset = [
      {
        key: 'specimen',
        label: 'screen.patient.details.specimen',
      },
      {
        key: 'externalId',
        label: 'screen.patient.details.externalId',
      },
      {
        key: 'type',
        label: 'screen.patient.details.type',
      },
      {
        key: 'specimenIdExt',
        label: 'screen.patient.details.specimenExternalId',
      },
      {
        key: 'sourceTissue',
        label: 'screen.patient.details.sourceTissue',
      },
      {
        key: 'tissueType',
        label: 'screen.patient.details.tissueType',
      },
    ];

    this.state.clinicalColumnPreset = [
      {
        key: 'ontology',
        label: 'screen.patient.details.ontology',
      },
      {
        key: 'code',
        label: 'screen.patient.details.code',
      },
      {
        key: 'term',
        label: 'screen.patient.details.term',
      },
      {
        key: 'notes',
        label: 'screen.patient.details.notes',
      },
      {
        key: 'observed',
        label: 'screen.patient.details.observed',
      },
      {
        key: 'consultation',
        label: 'screen.patient.details.consultation',
      },
      {
        key: 'apparition',
        label: 'screen.patient.details.apparition',
      },
    ];
  }


  getRequest() {
    const { patient } = this.props;
    const { requests } = patient;

    if (requests) {
      return requests.map(r => ({
        id: r.id, date: r.date, requester: r.requester, labo: r.organization,
      }));
    }
    return [];
  }

  getExtendedlRequest() {
    const { patient } = this.props;
    const { requests } = patient;

    if (requests) {
      return requests.map(r => ({
        specimen: r.specimen, externalId: '', type: r.type, specimenIdExt: '', sourceTissue: '', tissueType: '',
      }));
    }

    return [];
  }

  getClinical() {
    const { patient } = this.props;
    const { ontology } = patient;

    if (ontology) {
      return ontology.map((o) => {
        const observed = o.observed === 'POS' ? <IconKit className="iconPos" size={24} icon={ic_done} /> : <IconKit className="iconNeg" size={24} icon={ic_close} />;
        const code = (
          <Button
            key={uuidv1()}
            type="link"
            size={25}
            href="#"
            target="_blank"
            className="link"
          >
            {o.code}
          </Button>
        );
        return {
          ontology: o.ontology, code, term: o.term, notes: '', observed, consultation: o.consultation_date, apparition: o.apparition_date,
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
    actions.navigateToPatientScreen(patient.details.id, tab);
  }

  render() {
    const {
      app, router, patient,
    } = this.props;
    const { requestColumnPreset, extendRequestColumnPreset, clinicalColumnPreset } = this.state;
    const { showSubloadingAnimation } = app;
    const { hash } = router.location;
    const mrn = intl.get('screen.patient.details.mrn');
    const ramq = intl.get('screen.patient.details.ramq');
    const dateOfBirth = intl.get('screen.patient.details.dob');
    const organization = intl.get('screen.patient.details.organization');
    const gender = intl.get('screen.patient.details.gender');
    const ethnicity = intl.get('screen.patient.details.ethnicity');
    const study = intl.get('screen.patient.details.study');
    const proband = intl.get('screen.patient.details.proband');
    const preferringPractitioner = intl.get('screen.patient.details.referringPractitioner');
    const mln = intl.get('screen.patient.details.mln');
    const ageAtConsultation = intl.get('screen.patient.details.ageAtConsultation');
    const consultation = intl.get('screen.patient.details.consultation');
    const notes = intl.get('screen.patient.details.notes');
    const mother = intl.get('screen.patient.details.mother');
    const father = intl.get('screen.patient.details.father');
    const dateAndTime = intl.get('screen.patient.details.dateAndTime');
    const additionalInformation = intl.get('screen.patient.header.additionalInformation');
    const referringPractitioner = intl.get('screen.patient.header.referringPractitioner');
    const requests = intl.get('screen.patient.header.requests');
    const clinicalSigns = intl.get('screen.patient.header.clinicalSigns');
    const generalObservations = intl.get('screen.patient.header.generalObservations');
    const family = intl.get('screen.patient.header.family');
    const familyHistory = intl.get('screen.patient.header.familyHistory');
    const patientTab = intl.get('screen.patient.tab.patient');
    const clinicalTab = intl.get('screen.patient.tab.clinical');
    const familyType = intl.get('screen.patient.details.familyType');
    const newRequest = intl.get('screen.patient.header.newRequests');

    const name = `${patient.details.lastName},  ${patient.details.firstName}`;

    const probandTag = patient.details.proband === 'Proband' ? <Tag className="probandTag">{patient.details.proband}</Tag> : <Tag>{patient.details.proband}</Tag>;

    const getFamilyTypeIcon = () => {
      if (patient.family.composition === 'trio') {
        return (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 6C12.6569 6 14 4.65685 14 3C14 1.34315 12.6569 0 11 0C9.34315 0 8 1.34315 8 3C8 4.65685 9.34315 6 11 6Z" fill="#13C2C2" />
            <path d="M3 6C4.65685 6 6 4.65685 6 3C6 1.34315 4.65685 0 3 0C1.34315 0 0 1.34315 0 3C0 4.65685 1.34315 6 3 6Z" fill="#13C2C2" />
            <path d="M7 14C8.65685 14 10 12.6569 10 11C10 9.34315 8.65685 8 7 8C5.34315 8 4 9.34315 4 11C4 12.6569 5.34315 14 7 14Z" fill="#13C2C2" />
          </svg>
        );
      }
      if (patient.family.composition === 'duo') {
        return (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 6C8.65685 6 10 4.65685 10 3C10 1.34315 8.65685 0 7 0C5.34315 0 4 1.34315 4 3C4 4.65685 5.34315 6 7 6Z" fill="#13C2C2" />
            <path d="M7 14C8.65685 14 10 12.6569 10 11C10 9.34315 8.65685 8 7 8C5.34315 8 4 9.34315 4 11C4 12.6569 5.34315 14 7 14Z" fill="#13C2C2" />
          </svg>
        );
      }

      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10C8.65685 10 10 8.65685 10 7C10 5.34315 8.65685 4 7 4C5.34315 4 4 5.34315 4 7C4 8.65685 5.34315 10 7 10Z" fill="#13C2C2" />
        </svg>
      );
    };
    const familyTypeTag = <Tag className="familyTypeTag">{getFamilyTypeIcon()}{patient.family.composition}</Tag>;

    const Link = ({ url, text }) => (
      <Button
        key={uuidv1()}
        type="link"
        size={25}
        href={url}
        target="_blank"
        className="link"
      >
        {text}
      </Button>
    );

    const motherButton = (
      <a href="#" data-patient-id={patient.family.members.mother} className="familyLink" onClick={this.handleNavigationToPatientScreen}> { /* eslint-disable-line */ }
        {patient.family.members.mother}
      </a>
    );
    const fatherButton = (
      <a href="#" data-patient-id={patient.family.members.father} className="familyLink" onClick={this.handleNavigationToPatientScreen}> { /* eslint-disable-line */ }
        {patient.family.members.father}
      </a>
    );
    return (
      <Content type="auto">
        <Header />
        <Spin spinning={showSubloadingAnimation}>
          <div className="patientPage">
            <PageHeader
              className="patientHeader"
              title={(
                <div>
                  <Typography.Text className="patientName">
                    {`${patient.details.firstName} ${patient.details.lastName}`}
                  </Typography.Text>
                </div>
            )}
              extra={(
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a href="#" data-patient-id={patient.details.id} onClick={this.handleNavigationToPatientVariantScreen}>
                  <Button type="primary">
                  Variant Interpreter
                  </Button>
                </a>
            )}
            />
            <Tabs key={patient.details.id} onChange={this.handleTabNavigation} defaultActiveKey={(hash ? hash.replace('#', '') : 'patient')} className="tabs">
              <Tabs.TabPane
                key="personal"
                style={{ height: '100%' }}
                tab={(
                  <span className="tabName">
                    <IconKit size={24} icon={ic_person} />
                    {patientTab}
                  </span>
              )}
              >
                <Row type="flex" className="personalInfo">
                  <Col>
                    <DataList
                      title={name}
                      extraInfo={(
                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                        <Link
                          url="#"
                          className="extraInfoLink"
                          text={`${patient.details.id}`}
                        />
)}
                      dataSource={[
                        { label: ramq, value: patient.details.ramq },
                        { label: mrn, value: patient.details.mrn },
                        { label: organization, value: patient.organization.name },
                        { label: dateOfBirth, value: patient.details.birthDate },
                        { label: gender, value: patient.details.gender },
                        { label: proband, value: probandTag },
                        { label: study, value: patient.study.name },
                      ]}
                    />
                  </Col>
                  <Col className="gutter-row">
                    <DataList
                      title={additionalInformation}
                      dataSource={[
                        { label: ethnicity, value: patient.details.ethnicity },
                      ]}
                    />

                    <DataList
                      title={family}
                      dataSource={[
                        { label: familyType, value: familyTypeTag },
                        { label: father, value: fatherButton },
                        { label: mother, value: motherButton },
                      ]}
                    />
                  </Col>
                  <Col>
                    <DataList
                      title={referringPractitioner}
                      dataSource={[
                        { label: preferringPractitioner, value: patient.practitioner.name },
                        { label: mln, value: patient.practitioner.mln },
                      ]}
                    />
                    {
                    patient.consultations.map(pConsultation => (
                      <DataList
                        title={consultation}
                        extraInfo={<span className="extraInfo">{pConsultation.date}</span>}
                        dataSource={[
                          { label: preferringPractitioner, value: pConsultation.assessor },
                          { label: organization, value: pConsultation.organization },
                          { label: ageAtConsultation, value: pConsultation.age },
                        ]}
                      />
                    ))
                  }

                  </Col>
                </Row>
                <Row type="flex">
                  <Typography.Title level={4} style={{ marginBottom: 0 }} className="tableHeader pageWidth">
                    {requests}
                    <Button className="newRequestButton">+ {newRequest}</Button>
                  </Typography.Title>
                  <Table
                    pagination={false}
                    locale={{
                      emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                    }}
                    dataSource={this.getRequest()}
                    expandedRowRender={() => <Table className="expandedTable" pagination={false} columns={extendRequestColumnPreset.map(columnPresetToColumn)} dataSource={this.getExtendedlRequest()} />}
                    columns={requestColumnPreset.map(
                      columnPresetToColumn,
                    )}
                  />
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane
                key="clinical"
                tab={(
                  <span className="tabName">
                    <IconKit size={24} icon={ic_assignment} />
                    {clinicalTab}
                  </span>
              )}
                style={{ height: '100%' }}
              >
                <Row type="flex" className="clinicalSigns">
                  <Typography.Title level={4} style={{ marginBottom: 0 }} className="tableHeader">{clinicalSigns}</Typography.Title>
                  <Table
                    pagination={false}
                    columns={clinicalColumnPreset.map(
                      columnPresetToColumn,
                    )}
                    dataSource={this.getClinical()}
                  />
                </Row>
                {/*               <br />
              <br />
              <Row type="flex">
                <Typography.Title level={4}>{indications}</Typography.Title>
                <ResizableAntdTable
                  bordered
                  style={{ width: '100%' }}
                  pagination={false}
                  columns={[
                    { title: notes, dataIndex: 'note', key: 'note' },
                    { title: consultation, dataIndex: 'consultation_date', key: 'consultation_date' },
                  ]}
                  dataSource={patient.indications}
                  size="small"
                  rowKey="consultation"
                />
              </Row>
              <br />
              <br /> */}
                <Row type="flex" gutter={24}>
                  <Col span={12}>
                    <Typography.Title level={4} style={{ marginBottom: 0 }} className="tableHeader pageWidth">{generalObservations}</Typography.Title>
                    <Table
                      pagination={false}
                      columns={[
                        { title: notes, dataIndex: 'note', key: 'note' },
                        { title: consultation, dataIndex: 'consultation_date', key: 'consultation_date' },
                      ]}
                      dataSource={patient.observations}
                    />
                  </Col>


                  <Col span={12}>
                    <Typography.Title level={4} style={{ marginBottom: 0 }} className="tableHeader pageWidth">{familyHistory}</Typography.Title>
                    <Table
                      pagination={false}
                      columns={[
                        { title: notes, dataIndex: 'note', key: 'note' },
                        { title: dateAndTime, dataIndex: 'date', key: 'date' },
                      ]}
                      dataSource={patient.familyHistory}
                    />
                  </Col>
                </Row>

              </Tabs.TabPane>
            </Tabs>
          </div>
          <Footer />
        </Spin>

      </Content>
    );
  }
}

PatientScreen.propTypes = {
  app: PropTypes.shape(appShape).isRequired,
  router: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
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
  patient: state.patient,
  search: state.search,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientScreen);
