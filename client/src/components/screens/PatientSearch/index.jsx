import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, AutoComplete, Row, Col, Input, Icon, Menu, Typography, Tag, Pagination, Button,
} from 'antd';
import {
  Column, Table, Utils, Cell, RenderMode, TableLoadingOption,
} from '@blueprintjs/table';
import { ExportToCsv } from 'export-to-csv';
import { format } from 'util';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';
import { searchShape } from '../../../reducers/search';
import { navigateToPatientScreen } from '../../../actions/router';
import { autoCompletePatients, searchPatientsByQuery } from '../../../actions/patient';


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
      data: [],
      loading: TableLoadingOption.CELLS,
      size: 25,
      page: 1,
    };
    this.handleAutoCompleteChange = this.handleAutoCompleteChange.bind(this);
    this.handleAutoCompleteSelect = this.handleAutoCompleteSelect.bind(this);
    this.handleAutoCompletePressEnter = this.handleAutoCompletePressEnter.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
    this.getCellRenderer = this.getCellRenderer.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.handleTableCellsRendered = this.handleTableCellsRendered.bind(this);
    this.exportToTsv = this.exportToTsv.bind(this);
  }

  componentDidMount() {
    const { intl } = this.props;

    this.setState({
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
    const searchType = nextProps.search.lastSearchType;
    if (searchType !== 'autocomplete') {
      const data = nextProps.search[searchType].results.map((result) => {
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

    return null;
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

  exportToTsv() {
    const { page, size, data } = this.state;
    const { search } = this.props;
    const { lastSearchType } = search;
    const pages = Math.ceil((search[lastSearchType].total / size));
    const filename = `${lastSearchType}_${page}of${pages}`;
    const csvExporter = new ExportToCsv({
      filename,
      fieldSeparator: '\t',
      showLabels: true,
      useKeysAsHeaders: true,
    });

    csvExporter.generateCsv(data);
  }

  handleAutoCompleteChange(query) {
    if (query && query.length > 0) {
      const { actions } = this.props;
      const { size } = this.state;

      actions.autoCompletePatients('partial', query, 1, size);
      this.setState({
        page: 1,
        autoCompleteIsOpen: true,
      });
    }
  }

  handleAutoCompleteSelect(value) {
    const { actions } = this.props;
    const patientId = value.split(' ')[0] || null;
    if (patientId) {
      actions.navigateToPatientScreen(patientId);
    }
  }

  handleAutoCompletePressEnter(e) {
    const { size } = this.state;
    this.setState({
      autoCompleteIsOpen: false,
      page: 1,
      loading: TableLoadingOption.CELLS,
    });
    const { actions } = this.props;
    const query = e.currentTarget.attributes.value.nodeValue;

    if (!query || query.length < 1) {
      actions.searchPatientsByQuery(null, 1, size);
    } else {
      actions.autoCompletePatients('complete', query, 1, size);
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

  handlePageChange(page, size) {
    const { actions } = this.props;
    const { search } = this.props;
    this.setState({
      page,
      size,
    });

    if (search.lastSearchType === 'autocomplete') {
      actions.autoCompletePatients('partial', search.autocomplete.query, page, size);
    } else {
      actions.searchPatientsByQuery(search.patient.query, page, size);
    }
  }

  handlePageSizeChange(page, size) {
    this.handlePageChange(page, size);
  }

  handleTableCellsRendered() {
    const { loading } = this.state;
    if (loading) {
      this.setState({
        loading: null,
      });
    }
  }

  render() {
    const { intl, search } = this.props;
    const { patient } = search;
    const { total } = patient;
    const {
      columns, autoCompleteIsOpen, size, page, loading,
    } = this.state;
    const placeholderText = intl.formatMessage({ id: 'screen.patientsearch.placeholder' });
    const downloadText = intl.formatMessage({ id: 'screen.patientsearch.download' });
    const paginationText = intl.formatMessage({ id: 'screen.patientsearch.pagination' });
    const current = ((page - 1) * size) + 1;
    const pageTotal = size * page;

    return (
      <Content>
        <Header />
        <Navigation />
        <Card>
          <Row>
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
          <Row type="flex" align="bottom" style={{ paddingBottom: 5, paddingTop: 5 }}>
            <Col span={12} align="start">
              <Typography>
                { format(paginationText, current, (pageTotal <= total ? pageTotal : total), total) }
              </Typography>
            </Col>
            <Col span={12} align="end">
              <Button
                type="primary"
                shape="round"
                icon="download"
                size="small"
                onClick={this.exportToTsv}
              >
                {downloadText}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                numRows={(size <= total ? size : total)}
                enableColumnReordering
                enableColumnResizing
                onColumnsReordered={this.handleColumnsReordered}
                bodyContextMenuRenderer={renderBodyContextMenu}
                renderMode={RenderMode.BATCH}
                loadingOptions={[loading]}
                enableGhostCells
                onCompleteRender={this.handleTableCellsRendered}
              >
                { columns.map(column => (column)) }
              </Table>
            </Col>
          </Row>
          <br />
          <Row>
            <Col align="end" span={24}>
              <Pagination
                total={search.patient.total}
                pageSize={size}
                current={page}
                pageSizeOptions={['25', '50', '100', '250', '500', '1000']}
                showSizeChanger
                onChange={this.handlePageChange}
                onShowSizeChange={this.handlePageSizeChange}
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
    autoCompletePatients,
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
