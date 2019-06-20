import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, AutoComplete, Row, Col, Input, Icon,
} from 'antd';
import ResizableAntdTable from 'resizable-antd-table';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';
import { searchShape } from '../../../reducers/search';
import { navigateToPatientScreen } from '../../../actions/router';


class PatientSearchScreen extends React.Component {
  constructor() {
    super();
    this.handleSearchChange = () => {};
  }

  render() {
    const { intl, search, actions } = this.props;
    const dataSet = search.patient.results.map((result) => {
      const lastRequest = result.requests[result.requests.length - 1];

      return {
        pid: result.details.id,
        mrn: result.details.mrn,
        institution: result.organization.name,
        lastname: result.details.lastName,
        firstname: result.details.firstName,
        dob: result.details.birthDate,
        fid: result.family.id,
        position: result.details.proband ? 'Proband' : 'Parent',
        practitioner: result.practitioner.name,
        study: result.study,
        request: (lastRequest ? lastRequest.id : ''),
        status: (lastRequest ? lastRequest.status : ''),
      };
    });

    const placeholderText = intl.formatMessage({ id: 'screen.patientsearch.placeholder' });
    return (
      <Content>
        <Header />
        <Navigation />
        <Card>
          <Row type="flex" justify="center">
            <Col span={24}>
              <AutoComplete
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
              <br />
              <ResizableAntdTable
                bordered
                dataSource={dataSet}
                pagination={{
                  defaultPageSize: 25,
                  pageSizeOptions: [10, 25, 50, 100],
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                columns={[
                  {
                    title: 'Patient ID',
                    dataIndex: 'pid',
                    render: text => (
                      <navigation
                        data-patient-id={text}
                        onClick={(e) => {
                          const id = e.currentTarget.attributes['data-patient-id'].nodeValue;
                          actions.navigateToPatientScreen(id);
                        }}
                      >
                        {text}
                      </navigation>
                    ),
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.pid - b.pid,
                  },
                  {
                    title: 'MRN',
                    dataIndex: 'mrn',
                  },
                  {
                    title: 'Institution',
                    dataIndex: 'institution',
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.institution - b.institution,
                  },
                  {
                    title: 'Nom',
                    dataIndex: 'lastname',
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.lastname - b.lastname,
                  },
                  {
                    title: 'Prénom',
                    dataIndex: 'firstname',
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.firstname - b.firstname,
                  },
                  {
                    title: 'Date de naissance',
                    dataIndex: 'dob',
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.dob - b.dob,
                  },
                  {
                    title: 'Famille ID',
                    dataIndex: 'fid',
                    render: text => (
                      <navigation
                        data-patient-family-id={text}
                      >
                        {text}
                      </navigation>
                    ),
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.fid - b.fid,
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
                        value: 'Parent',
                      },
                    ],
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.request - b.request,
                    onFilter: (value, record) => record.position.indexOf(value) === 0,
                  },
                  {
                    title: 'Médecin référent',
                    dataIndex: 'practitioner',
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.practitioner - b.practitioner,
                  },
                  {
                    title: 'Étude',
                    dataIndex: 'study',
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.study - b.study,
                  },
                  {
                    title: 'Requête',
                    dataIndex: 'request',
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.request - b.request,
                  },
                  {
                    title: 'Statut',
                    dataIndex: 'status',
                    filters: [
                      {
                        text: 'Actif',
                        value: 'active',
                      },
                      {
                        text: 'Complété',
                        value: 'completed',
                      },
                    ],
                    sortDirections: ['descend', 'ascend'],
                    sorter: (a, b) => a.request - b.request,
                    onFilter: (value, record) => record.status.indexOf(value) === 0,
                  },

                ]}
                title={() => <div style={{ textAlign: 'right' }}>{`${dataSet.length} / ${search.patient.total} Patients`}</div>}
                size="small"
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
  search: PropTypes.shape(searchShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    navigateToPatientScreen,
  }, dispatch),
});

const mapStateToProps = state => ({
  intl: state.intl,
  search: state.search,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(PatientSearchScreen));
