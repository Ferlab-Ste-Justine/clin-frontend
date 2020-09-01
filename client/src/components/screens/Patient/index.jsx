/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
import React from 'react';
import shortid from 'shortid';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Col, Row, Tabs, PageHeader, Typography, Button, Spin, Table, Empty, Tag, Badge, Card, List, Collapse, Popover,
} from 'antd';
import {
  find,
} from 'lodash';


import IconKit from 'react-icons-kit';
import {
  ic_person, ic_assignment, ic_done, ic_close, ic_add, ic_info, ic_visibility, ic_visibility_off, ic_help,
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

import '../../../style/themes/antd-clin-theme.less';
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
    this.getIndication = this.getIndication.bind(this);
    this.getObservations = this.getObservations.bind(this);
    this.getHistorical = this.getHistorical.bind(this);
    this.handleNavigationToPatientSearchScreen = this.handleNavigationToPatientSearchScreen.bind(this);
    this.handleNavigationToPatientVariantScreen = this.handleNavigationToPatientVariantScreen.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);

    this.state.requestColumnPreset = [
      {
        key: 'date',
        label: 'screen.patient.details.date',
      },
      {
        key: 'practitioner',
        label: 'screen.patient.details.referringPractitioner',
      },
      {
        key: 'organization',
        label: 'screen.patient.details.organization',
      },
      {
        key: 'requester',
        label: 'screen.patient.details.createdBy',
      },
      {
        key: 'test',
        label: 'screen.patient.details.test',
      },
      {
        key: 'status',
        label: 'screen.patient.details.status',
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
    const { patient } = this.props;
    const { requests } = patient;
    if (requests) {
      return requests.map((r) => {
        const status = <span><Badge className="impact" color={r.status === 'active' ? '#FA8C16' : '#52c41a'} />{r.status}</span>;
        const practitionerPopOverText = (
          <div>
            <p>Dre Julie Doucet</p>
            <p>MLN: 4425615</p>
            <p>Hopital: CHU Sainte Justine</p>
            <p>Tel. (514) 456-367 poste: 3542</p>
            <p>Courriel: julie.doucet@chu-ste-justine.qc.ca</p>
          </div>
        );
        const practitioner = (
          <Popover placement="topRight" content={practitionerPopOverText} trigger="hover">
            <span className="logoText">{r.requester} <Button type="link"><IconKit size={20} icon={ic_info} /></Button></span>
          </Popover>
        );
        return {
          date: r.date, practitioner, organization: r.organization, requester: practitioner, test: r.type, status,
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
            return (<IconKit className="observedIcon icon" size={14} icon={ic_visibility} />);
          }
          if (status === 'NEG') {
            return (<IconKit className="notObservedIcon icon" size={14} icon={ic_visibility_off} />);
          }

          return (<IconKit className="unknownIcon icon" size={14} icon={ic_help} />);
        };
        const observed = getObservedIcon(o.observed);
        const code = (
          <Button
            key={uuidv1()}
            type="link"
            size="default"
            href="#"
            target="_blank"
            className="link"
          >
            {o.code}
          </Button>
        );
        const note = o.note ? o.note : '--';
        const dateC = o.consultation_date.split('T');
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
    actions.navigateToPatientScreen(patient.details.id, tab);
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
    const organization = intl.get('screen.patient.details.organization');
    const genderTitle = intl.get('screen.patient.details.gender');
    const male = intl.get('screen.patient.details.male');
    const female = intl.get('screen.patient.details.female');
    const ethnicity = intl.get('screen.patient.details.ethnicity');
    const consanguinity = intl.get('screen.patient.details.consanguinity');
    const study = intl.get('screen.patient.details.study');
    const proband = intl.get('screen.patient.details.proband');
    const preferringPractitioner = intl.get('screen.patient.details.referringPractitioner');
    const ageAtConsultation = intl.get('screen.patient.details.ageAtConsultation');
    const consultation = intl.get('screen.patient.details.consultation');
    /*     const mother = intl.get('screen.patient.details.mother');
    const father = intl.get('screen.patient.details.father');
    const additionalInformation = intl.get('screen.patient.header.additionalInformation'); */
    const referringPractitioner = intl.get('screen.patient.header.referringPractitioner');
    const requests = intl.get('screen.patient.header.requests');
    const clinicalSigns = intl.get('screen.patient.header.clinicalSigns');
    const indication = intl.get('screen.patient.header.indications');
    const generalObservations = intl.get('screen.patient.header.generalObservations');
    const family = intl.get('screen.patient.header.family');
    const familyHistory = intl.get('screen.patient.header.familyHistory');
    const patientTab = intl.get('screen.patient.tab.patient');
    const clinicalTab = intl.get('screen.patient.tab.clinical');
    const familyType = intl.get('screen.patient.details.familyType');
    const newRequest = intl.get('screen.patient.header.newRequests');

    const { Panel } = Collapse;

    const name = `${patient.details.lastName}, ${patient.details.firstName} `;

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
    const headerPractitioner = (<Typography.Title level={4} className="datalisteHeader" style={{ marginBottom: 0 }}>{referringPractitioner}</Typography.Title>);
    const Link = ({ url, text }) => (
      <Button
        key={uuidv1()}
        type="link"
        size="default"
        href={url}
        target="_blank"
      >
        {text}
      </Button>
    );

    const formatDate = (date) => {
      const fDate = date.split('T');
      return fDate[0];
    };
    const lastIndex = patient.requests.length - 1;
    const lastRequest = patient.requests[lastIndex] ? patient.requests[lastIndex].status : null;
    console.log('lastRequest', lastRequest);

    const statusBadge = () => {
      if (lastRequest === 'active') {
        return (<Badge className="badge" color="#ffa812" text={lastRequest} />);
      }
      if (lastRequest === 'completed') {
        return (<Badge className="badge" color="#52c41a" text={lastRequest} />);
      }
      return '';
    };
    return (
      <Content type="auto">
        <Header />
        <Spin spinning={showSubloadingAnimation}>
          <div className="patientPage">
            <div className="page_headerStaticNoMargin">
              <div className="headerStaticContent">
                <Row type="flex" justify="space-between">
                  <Col>
                    <Typography.Title level={3} className="patientName">
                      {`${patient.details.lastName}, ${patient.details.firstName} (${patient.details.gender})  ${patient.details.proband}`}
                      {statusBadge()}
                    </Typography.Title>
                    <Typography.Title level={4} className="patientName">
                      {patient.details.birthDate}
                    </Typography.Title>
                  </Col>
                  <Col>
                    <a href="#" data-patient-id={patient.details.id} onClick={this.handleNavigationToPatientVariantScreen}>
                      <Button type="primary">
                  Variant Interpreter
                      </Button>
                    </a>
                  </Col>
                </Row>


              </div>
            </div>
            <Tabs key={patient.details.id} onChange={this.handleTabNavigation} defaultActiveKey={(hash ? hash.replace('#', '') : 'patient')} className="tabs staticTabs">
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
                <div className="page-static-content">
                  <Card title="Informations générales" className="staticCard halfPageCard" bordered={false}>
                    <List
                      dataSource={[
                        {
                          label: name,
                          value: patient.details.id,
                        },
                        { label: ramq, value: 'ROYL 12345 455' },
                        { label: mrn, value: '4352661' },
                        { label: organization, value: 'CHU Sainte-Justine' },
                        { label: dateOfBirth, value: ' 2018-12-04' },
                        { label: genderTitle, value: 'Féminin' },
                        { label: ethnicity, value: 'Canadien Francais' },
                        { label: consanguinity, value: 'non' },
                        { label: family, value: '[FA452622]' },
                        { label: familyType, value: familyTypeTag },
                        { label: proband, value: 'Proband' },
                      ]}
                      locale={{
                        emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                      }}
                      renderItem={item => (
                        <List.Item className="listRow">
                          <Row type="flex" justify="space-between" style={{ width: '100%' }}>
                            <Col className="rowTitle">
                              <Typography.Text>{item.label}</Typography.Text>
                            </Col>
                            <Col className="rowValue">
                              <Typography.Text>{item.value}</Typography.Text>
                            </Col>
                          </Row>
                        </List.Item>
                      )}
                    />
                  </Card>
                  <Row>
                    <Card title="Requête" className="staticCard" bordered={false}>
                      <Table
                        pagination={false}
                        columns={requestColumnPreset.map(
                          columnPresetToColumn,
                        )}
                        dataSource={this.getRequest()}
                      />
                    </Card>
                  </Row>
                </div>
<<<<<<< HEAD
                {/* <Row type="flex" className="personalInfo">
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
                        { label: gender, value: patient.details.gender === 'male' ? male : female },
                        { label: proband, value: probandTag },
                        { label: study, value: studyLink },
                        { label: familyType, value: familyTypeTag },
                        { label: ethnicity, value: patient.details.ethnicity },
                      ]}
                    />
                  </Col>


                  <Col>
                    <Card className="datalist" title={headerPractitioner} type="inner" size="small" hoverable>
                      <List
                        size="small"
                        dataSource={[
                          `${patient.practitioner.name} | ${patient.practitioner.mln} `,
                          '--',
                        ]}
                        locale={{
                          emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                        }}
                        renderItem={item => (
                          <List.Item className="listRow">
                            <Row type="flex" justify="space-between" style={{ width: '100%' }}>
                              <Typography.Text>{item}</Typography.Text>
                            </Row>
                          </List.Item>
                        )}
                      />
                    </Card>
                    {
                    patient.consultations.map(pConsultation => (
                      <DataList
                        key={shortid.generate()}
                        title={consultation}
                        extraInfo={<span className="extraInfo">{formatDate(pConsultation.date)}</span>}
                        dataSource={[
                          { label: preferringPractitioner, value: pConsultation.assessor },
                          { label: organization, value: pConsultation.organization },
                          { label: ageAtConsultation, value: `${pConsultation.age} jours` },
                        ]}
                      />
                    ))
                  }

                  </Col>
                </Row>
                <Row type="flex">
                  <Typography.Title level={4} style={{ marginBottom: 0 }} className="tableHeader pageWidth">
                    {requests}
                    <Button className="newRequestButton"><IconKit size={14} icon={ic_add} /> {newRequest}</Button>
                  </Typography.Title>
                  <Table
                    rowKey={() => shortid.generate()}
                    pagination={false}
                    locale={{
                      emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                    }}
                    dataSource={this.getRequest()}
                    defaultExpandAllRows
                    className="requestTable"
                    expandedRowRender={() => (
                      <Table
                        rowKey={() => shortid.generate()}
                        className="expandedTable"
                        pagination={false}
                        columns={extendRequestColumnPreset.map(columnPresetToColumn)}
                        dataSource={this.getExtendedlRequest()}
                      />
                    )}
                    columns={requestColumnPreset.map(
                      columnPresetToColumn,
                    )}
                  />
                </Row> */}
=======
>>>>>>> code refactoring
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
                <div className="page-static-content">
                  <Card bordered={false} className="staticCard">
                    <Collapse bordered={false} defaultActiveKey={['1']}>
                      <Panel header="2020-06-05" key="1">
                        <div className="halfPageCard">
                          <DataList
                            title="Informations générales"
                            dataSource={[
                              { label: 'Age a la consultation', value: '3 ans' },
                              {
                                label: 'Medicin Référant',
                                value: 'Dre Julie DOUCET',
                              },
                            ]}
                          />
                        </div>
                        <div className="halfPageCard">
                          <DataList
                            title="Résume de l'investigation"
                            dataSource={[
                              { label: 'cgh', value: 'anormal' },
                              {
                                label: 'Résumer',
                                value:
                'Echographie anormale a 3 mois teste neurologique realise le 2019-03-06 [voir +]',
                              },
                            ]}
                          />
                        </div>
                        <Card title="Histoire familiale" bordered={false} className="tierPageCard staticCard">
                          <Table
                            pagination={false}
                            columns={familyHistoryColumnPreset.map(
                              columnPresetToColumn,
                            )}
                            dataSource={this.getFamilyHistory()}
                          />
                        </Card>

                        <Card title="Signes cliniques" bordered={false} className="staticCard">
                          <Table
                            pagination={false}
                            columns={clinicalColumnPreset.map(
                              columnPresetToColumn,
                            )}
                            dataSource={this.getClinical()}
                          />
                        </Card>
                        <div className="tierPageCard">
                          <DataList
                            title="Indications"
                            dataSource={[
                              {
                                label: 'Hypothèse(s) de diagnostic',
                                value: 'Syndrome de microdeletion',
                              },
                            ]}
                          />
                        </div>

                      </Panel>
                    </Collapse>
                  </Card>

<<<<<<< HEAD
                  {/* <Row type="flex" className="indications" gutter={24}>
                    <Col span={12}>
                      <Typography.Title level={4} style={{ marginBottom: 0 }} className="tableHeader">{indication}</Typography.Title>
                      <Table
                        pagination={false}
                        columns={notesColumnPreset.map(
                          columnPresetToColumn,
                        )}
                        dataSource={this.getIndication()}
                      />
                    </Col>
                  </Row>
                  <Row type="flex" className="clinicalSigns">
                    <Typography.Title level={4} style={{ marginBottom: 0 }} className="tableHeader">{clinicalSigns}</Typography.Title>
                    <Table
                      rowKey={() => shortid.generate()}
                      pagination={false}
                      columns={clinicalColumnPreset.map(
                        columnPresetToColumn,
                      )}
                      dataSource={this.getClinical()}
                    />
                  </Row>
                  <Row type="flex" gutter={24}>
                    <Col span={12}>
                      <Typography.Title level={4} style={{ marginBottom: 0 }} className="tableHeader pageWidth">{generalObservations}</Typography.Title>
                      <Table
                        pagination={false}
                        columns={notesColumnPreset.map(
                          columnPresetToColumn,
                        )}
                        dataSource={this.getObservations()}
                      />
                    </Col>


                    <Col span={12}>
                      <Typography.Title level={4} style={{ marginBottom: 0 }} className="tableHeader pageWidth">{familyHistory}</Typography.Title>
                      <Table
                        pagination={false}
                        columns={familyHistoryColumnPreset.map(
                          columnPresetToColumn,
                        )}
                        dataSource={this.getHistorical()}
                      />
                    </Col>
                  </Row> */}
=======
>>>>>>> code refactoring
                </div>
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
