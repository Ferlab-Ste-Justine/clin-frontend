import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, AutoComplete, Row, Col, Input, Icon, Menu, Typography, Tag,
} from 'antd';
import {
  Column, Table, Utils, Cell, RenderMode, // ColumnHeaderCell
} from '@blueprintjs/table';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';
import { searchShape } from '../../../reducers/search';
import { navigateToPatientScreen } from '../../../actions/router';
import { autoCompletePartialPatients, autoCompleteFullPatients, searchPatientsByQuery } from '../../../actions/patient';


/*
const getColumnHeaderCellRenderer = name => () => {
  <ColumnHeaderCell name={name} />;
};
*/

const renderBodyContextMenu = context => (
  <Menu>
    <Menu.Item context={context}>Copy</Menu.Item>
  </Menu>
);

class PatientSearchScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      autoCompleteIsOpen: false,
      columns: [],
      columnWidths: [],
      data: [],
    };
    this.handleAutoCompleteChange = this.handleAutoCompleteChange.bind(this);
    this.handleAutoCompleteSelect = this.handleAutoCompleteSelect.bind(this);
    this.handleAutoCompletePressEnter = this.handleAutoCompletePressEnter.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
    this.getCellRenderer = this.getCellRenderer.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
  }

  componentDidMount() {
    const { intl } = this.props;

    this.setState({
      columnWidths: [
        100,
        100,
        100,
        300,
        120,
        120,
        100,
        100,
        100,
        200,
        100,
      ],
      columns: [
        <Column
          key="1"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.status' })}
          cellRenderer={this.getCellRenderer('status', 'status-tag')}
          // columnHeaderCellRenderer={getColumnHeaderCellRenderer(columnStatus).bind(this)}
        />,
        <Column
          key="2"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.patientId' })}
          cellRenderer={this.getCellRenderer('id', 'patient-link')}
        />,
        <Column
          key="3"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.mrn' })}
          cellRenderer={this.getCellRenderer('mrn')}
        />,
        <Column
          key="4"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.organization' })}
          cellRenderer={this.getCellRenderer('organization')}
        />,
        <Column
          key="5"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.firstName' })}
          cellRenderer={this.getCellRenderer('firstName')}
        />,
        <Column
          key="6"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.lastName' })}
          cellRenderer={this.getCellRenderer('lastName')}
        />,
        <Column
          key="7"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.dob' })}
          cellRenderer={this.getCellRenderer('birthDate')}
        />,
        <Column
          key="8"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.familyId' })}
          cellRenderer={this.getCellRenderer('familyId')}
        />,
        <Column
          key="9"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.position' })}
          cellRenderer={this.getCellRenderer('proband')}
        />,
        <Column
          key="10"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.practitioner' })}
          cellRenderer={this.getCellRenderer('practitioner')}
        />,
        <Column
          key="11"
          name={intl.formatMessage({ id: 'screen.patientsearch.table.request' })}
          cellRenderer={this.getCellRenderer('request')}
        />,
      ],
    });
  }

  static getDerivedStateFromProps(nextProps) {
    const data = nextProps.search.patient.results.map((result) => {
      const lastRequest = result.requests[result.requests.length - 1];
      return {
        status: (lastRequest ? lastRequest.status : ''),
        id: result.details.id,
        mrn: result.details.mrn,
        organization: result.organization.name,
        firstName: result.details.firstName,
        lastName: result.details.lastName,
        birthDate: result.details.birthDate,
        familyId: result.family.id,
        proband: result.details.proband,
        practitioner: result.practitioner.name,
        request: (lastRequest ? lastRequest.id : ''),
      };
    });
    return { data };
  }

  getCellRenderer(key, type) {
    switch (type) {
      case 'patient-link':
        return (row) => {
          const { actions } = this.props;
          const { data } = this.state;
          const value = data[row] ? data[row][key] : '';
          return (
            <Cell>
              <a /* eslint-disable-line */
                data-patient-id={value}
                onClick={(e) => {
                  const id = e.currentTarget.attributes['data-patient-id'].nodeValue;
                  actions.navigateToPatientScreen(id);
                }}
              >
                {value}
              </a>
            </Cell>
          );
        };
      case 'status-tag':
        return (row) => {
          const { data } = this.state;
          const value = data[row] ? data[row][key] : '';
          return (
            <Cell>
              {value && (
              <Tag color={value === 'completed' ? 'green' : ''}>
                {value}
              </Tag>
              )
                }
            </Cell>
          );
        };

      default:
        return (row) => {
          const { data } = this.state;
          return <Cell>{data[row] ? data[row][key] : ''}</Cell>;
        };
    }
  }

  handleAutoCompleteChange(query) {
    const { actions } = this.props;
    actions.autoCompletePartialPatients(query);
    this.setState({
      autoCompleteIsOpen: true,
    });
  }

  handleAutoCompleteSelect(value) {
    const { actions } = this.props;
    const patientId = value.split(' ')[0] || null;
    if (patientId) {
      actions.navigateToPatientScreen(patientId);
    }
  }

  handleAutoCompletePressEnter(e) {
    this.setState({
      autoCompleteIsOpen: false,
    });
    const { actions } = this.props;
    const query = e.currentTarget.attributes.value.nodeValue;
    if (query) {
      actions.autoCompleteFullPatients(query);
    }
  }

  handleColumnsReordered(oldIndex, newIndex, length) {
    if (oldIndex === newIndex) {
      return;
    }
    const { columns } = this.state;
    const nextChildren = Utils.reorderArray(columns, oldIndex, newIndex, length);
    this.setState({ columns: nextChildren });
  }

  render() {
    const { intl, search } = this.props;
    const {
      data, columns, columnWidths, autoCompleteIsOpen,
    } = this.state;
    const placeholderText = intl.formatMessage({ id: 'screen.patientsearch.placeholder' });

    return (
      <Content type="auto">
        <Header />
        <Navigation />
        <Card>
          <Row type="flex" justify="center">
            <Col span={24}>
              <AutoComplete
                size="large"
                style={{ width: '100%' }}
                optionLabelProp="text"
                placeholder={placeholderText}
                allowClear
                autoFocus
                defaultActiveFirstOption={false}
                enableGhostCells
                dataSource={search.autocomplete.results}
                onChange={this.handleAutoCompleteChange}
                onSelect={this.handleAutoCompleteSelect}
                open={autoCompleteIsOpen}
              >
                <Input prefix={<Icon type="search" />} onPressEnter={this.handleAutoCompletePressEnter} />
              </AutoComplete>
            </Col>
          </Row>
          <Row type="flex" justify="end">
            <Col align="end" span={24}>
              <br />
              <Typography.Text>
                {data.length}
                {' '}
Patients
              </Typography.Text>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col span={24}>
              <Table
                numRows={data.length + 1}
                enableColumnReordering
                enableColumnResizing
                onColumnsReordered={this.handleColumnsReordered}
                bodyContextMenuRenderer={renderBodyContextMenu}
                enableGhostCells
                columnWidths={columnWidths}
                renderMode={RenderMode.BATCH}
              >
                { columns.map(column => (column)) }
              </Table>
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
    autoCompletePartialPatients,
    autoCompleteFullPatients,
    searchPatientsByQuery,
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
