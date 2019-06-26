/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, AutoComplete, Row, Col, Input, Icon, Menu, Typography,
} from 'antd';
import {
  Column, Table, Utils, ColumnHeaderCell, Cell, RenderMode,
} from '@blueprintjs/table';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';
import { searchShape } from '../../../reducers/search';
import { navigateToPatientScreen } from '../../../actions/router';
import { autoCompletePartialPatients, autoCompleteFullPatients, searchPatientsByQuery } from '../../../actions/patient';


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
    this.renderBodyContextMenu = this.renderBodyContextMenu.bind(this);
    this.getCellRenderer = this.getCellRenderer.bind(this);
    this.getColumnHeaderCellRenderer = this.getColumnHeaderCellRenderer.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
  }

  componentDidMount() {
    const columnId = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.patientId' });
    const columnMrn = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.mrn' });
    const columnOrganization = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.organization' });
    const columnFirstName = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.firstName' });
    const columnLastName = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.lastName' });
    const columnDob = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.dob' });
    const columnFamilyId = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.familyId' });
    const columnPosition = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.position' });
    const columnPractitioner = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.practitioner' });
    const columnRequest = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.request' });
    const columnStatus = this.props.intl.formatMessage({ id: 'screen.patientsearch.table.status' });

    this.setState({
      columnWidths: [
        75,
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
          name={columnStatus}
          cellRenderer={this.getCellRenderer('status')}
          // columnHeaderCellRenderer={this.getColumnHeaderCellRenderer(columnStatus).bind(this)}
        />,
        <Column
          key="2"
          name={columnId}
          cellRenderer={this.getCellRenderer('id', 'patient-link')}
          // columnHeaderCellRenderer={this.getColumnHeaderCellRenderer(columnId).bind(this)}
        />,
        <Column
          key="3"
          name={columnMrn}
          cellRenderer={this.getCellRenderer('mrn')}
        />,
        <Column
          key="4"
          name={columnOrganization}
          cellRenderer={this.getCellRenderer('organization')}
        />,
        <Column
          key="5"
          name={columnFirstName}
          cellRenderer={this.getCellRenderer('firstName')}
        />,
        <Column
          key="6"
          name={columnLastName}
          cellRenderer={this.getCellRenderer('lastName')}
        />,
        <Column
          key="7"
          name={columnDob}
          cellRenderer={this.getCellRenderer('dob')}
        />,
        <Column
          key="8"
          name={columnFamilyId}
          cellRenderer={this.getCellRenderer('familyId')}
        />,
        <Column
          key="9"
          name={columnPosition}
          cellRenderer={this.getCellRenderer('proband')}
        />,
        <Column
          key="10"
          name={columnPractitioner}
          cellRenderer={this.getCellRenderer('practitioner')}
        />,
        <Column
          key="11"
          name={columnRequest}
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
          const value = this.state.data[row] ? this.state.data[row][key] : '';
          return (
            <Cell>
              <a /* eslint-disable-line */
                data-patient-id={value}
                onClick={(e) => {
                  const id = e.currentTarget.attributes['data-patient-id'].nodeValue;
                  this.props.actions.navigateToPatientScreen(id);
                }}
              >
                {value}
              </a>
            </Cell>
          );
        };
      default:
        return row => (
          <Cell>{this.state.data[row] ? this.state.data[row][key] : ''}</Cell>
        );
    }
  }

  getColumnHeaderCellRenderer(name) {
    return () => {
      <ColumnHeaderCell name={name} />;
    };
  }

  renderBodyContextMenu(context) {
    return (
      <Menu>
        <Menu.Item context={context}>Copy</Menu.Item>
      </Menu>
    );
  }

  handleAutoCompleteChange(query) {
    this.props.actions.autoCompletePartialPatients(query);
    this.setState({
      autoCompleteIsOpen: true,
    });
  }

  handleAutoCompleteSelect(value) {
    const patientId = value.split(' ')[0] || null;
    if (patientId) {
      this.props.actions.navigateToPatientScreen(patientId);
    }
  }

  handleAutoCompletePressEnter(e) {
    this.setState({
      autoCompleteIsOpen: false,
    });
    const query = e.currentTarget.attributes.value.nodeValue;
    if (query) {
      this.props.actions.autoCompleteFullPatients(query);
    }
  }

  handleColumnsReordered(oldIndex, newIndex, length) {
    if (oldIndex === newIndex) {
      return;
    }
    const nextChildren = Utils.reorderArray(this.state.columns, oldIndex, newIndex, length);
    this.setState({ columns: nextChildren });
  }

  render() {
    const { intl, search } = this.props;
    const placeholderText = intl.formatMessage({ id: 'screen.patientsearch.placeholder' });

    return (
      <Content>
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
                open={this.state.autoCompleteIsOpen}
              >
                <Input prefix={<Icon type="search" />} onPressEnter={this.handleAutoCompletePressEnter} />
              </AutoComplete>
            </Col>
          </Row>
          <Row type="flex" justify="end">
            <Col align="end" span={24}>
              <br />
              <Typography.Text>
                {this.state.data.length}
                {' '}
Patients
              </Typography.Text>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col span={24}>
              <Table
                numRows={(this.state.data.length + 1)}
                enableColumnReordering
                enableColumnResizing
                onColumnsReordered={this.handleColumnsReordered}
                bodyContextMenuRenderer={this.renderBodyContextMenu}
                enableGhostCells
                columnWidths={this.state.columnWidths}
                renderMode={RenderMode.BATCH}
              >
                { this.state.columns.map(column => (column)) }
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
