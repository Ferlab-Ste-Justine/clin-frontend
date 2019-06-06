import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  Card, Table, AutoComplete, Row, Col, Input, Icon,
} from 'antd';
// import { Link } from 'react-router-dom';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';


const columns = [
  {
    title: 'Patient ID',
    dataIndex: 'pid',
    render: text => <Link to={`/patient/${text}`}>{text}</Link>, // eslint-disable-line
    sortDirections: ['descend', 'ascend'],
    sorter: (a, b) => a.pid - b.pid,
    fixed: 'left',
    width: 100,
  },
  {
    title: 'MRN',
    dataIndex: 'mrn',
    width: 150,
  },
  {
    title: 'Institution',
    dataIndex: 'institution',
    sortDirections: ['descend', 'ascend'],
    sorter: (a, b) => a.institution - b.institution,
    width: 150,
  },
  {
    title: 'Nom',
    dataIndex: 'lastname',
    sortDirections: ['descend', 'ascend'],
    sorter: (a, b) => a.lastname - b.lastname,
    width: 150,
  },
  {
    title: 'Prénom',
    dataIndex: 'firstname',
    sortDirections: ['descend', 'ascend'],
    sorter: (a, b) => a.firstname - b.firstname,
    width: 150,
  },
  {
    title: 'Date de naissance',
    dataIndex: 'dob',
    sortDirections: ['descend', 'ascend'],
    sorter: (a, b) => a.dob - b.dob,
    width: 150,
  },
  {
    title: 'Famille ID',
    dataIndex: 'fid',
    render: text => <Link to={`/patient/family/${text}`}>{text}</Link>, // eslint-disable-line
    sortDirections: ['descend', 'ascend'],
    sorter: (a, b) => a.fid - b.fid,
    width: 150,
  },
  {
    title: 'Position',
    dataIndex: 'position',
    filters: [
      {
        text: 'Proband',
        value: 'Proband',
      },
      {
        text: 'Parent',
        value: 'notproband',
      },
    ],
    onFilter: (value, record) => record.position.indexOf(value) === 0,
    width: 150,
  },
  {
    title: 'Médecin référent',
    dataIndex: 'practicionner',
    sortDirections: ['descend', 'ascend'],
    sorter: (a, b) => a.practicionner - b.practicionner,
    width: 150,
  },
  {
    title: 'Étude',
    dataIndex: 'study',
    sortDirections: ['descend', 'ascend'],
    sorter: (a, b) => a.study - b.study,
    width: 150,
  },
  {
    title: 'Requête',
    dataIndex: 'request',
    sortDirections: ['descend', 'ascend'],
    sorter: (a, b) => a.request - b.request,
    width: 150,
  },
  {
    title: 'Statut',
    dataIndex: 'status',
    filters: [
      {
        text: 'En cours',
        value: 'En cours',
      },
      {
        text: 'Complété',
        value: 'Complété',
      },
    ],
    onFilter: (value, record) => record.status.indexOf(value) === 0,
    width: 150,
  },
  {
    title: 'Actions',
    key: 'action',
    fixed: 'right',
    width: 50,
    className: 'column-action',
    render: () => [<Icon type="folder-open" />],
  },
];

const dataset = [
  {
    pid: 'PT000030',
    mrn: '45821',
    institution: 'CHUSJ',
    lastname: 'Legendre',
    firstname: 'Bruno',
    dob: '2018-09-11',
    fid: 'FA93837',
    position: 'Proband',
    practicionner: 'Dr. Patrick DUJARDIN',
    study: 'Rapidomix',
    request: 'SR000002',
    status: 'En cours',
  },
  {
    pid: 'PT000045',
    mrn: '45822',
    institution: 'CHUSJ',
    lastname: 'Tartempion',
    firstname: 'Roger',
    dob: '2018-08-11',
    fid: 'FA181717',
    position: 'Parent',
    practicionner: 'Dr. Patrick DUJARDIN',
    study: 'Rapidomix',
    request: 'SR000003',
    status: 'Complétée',
  },
];

class PatientSearchScreen extends React.Component {
  constructor() {
    super();
    this.handleSearchChange = () => {};
  }

  render() {
    const { search, intl } = this.props;
    const placeholderText = intl.formatMessage({ id: 'screen.patientsearch.placeholder' });
    return (
      <Content>
        <Header />
        <Navigation />
        <Card>
          <Row type="flex" justify="center">
            <Col span={24}>
              <AutoComplete
                dataSource={search}
                onChange={this.handleSearchChange}
                size="large"
                style={{ width: '100%' }}
                optionLabelProp="text"
                placeholder={placeholderText}
                allowClear
                autoFocus
              >
                <Input prefix={<Icon type="search" />} />
              </AutoComplete>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col span={24}>
              <Table
                bordered
                size="small"
                pagination={{ position: 'both' }}
                dataSource={dataset}
                columns={columns}
                scroll={{ x: 1800 }}
              />
            </Col>
          </Row>
        </Card>
        <Footer />
      </Content>
    );
  }
}

PatientSearchScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  search: PropTypes.shape({}).isRequired,
};

export default injectIntl(PatientSearchScreen);
