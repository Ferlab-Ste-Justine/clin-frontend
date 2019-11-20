/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, AutoComplete, Row, Col, Input, Icon, Menu, Typography, Pagination, Button, Dropdown, Popover, Checkbox,
} from 'antd';
import {
  Column, Table, Utils, Cell, RenderMode,
} from '@blueprintjs/table';
import { ExportToCsv } from 'export-to-csv';
import { format } from 'util';
import IconKit from 'react-icons-kit';
import {
  ic_tune, ic_add, ic_swap_horiz, ic_view_column, ic_cloud_download, ic_search, ic_replay, ic_keyboard_arrow_right, ic_keyboard_arrow_down, ic_close
} from 'react-icons-kit/md';
import {
  cloneDeep, filter, pullAllBy, isEqual, find, findIndex,
} from 'lodash';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';
import style from '../../../containers/App/style.module.scss';

import { searchShape } from '../../../reducers/search';
import { navigateToPatientScreen } from '../../../actions/router';
import { autoCompletePatients, searchPatientsByQuery } from '../../../actions/patient';


/*
const getColumnHeaderCellRenderer = name => () => {
  <ColumnHeaderCell name={name} />;
};
*/
const { Text } = Typography;
const renderBodyContextMenu = context => (
  <Menu>
    <Menu.Item context={context}>Copy</Menu.Item>
  </Menu>
);

class PatientSearchScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      autoCompleteIsOpen: false,
      allColumns: [],
      visibleColumns: [],
      data: [],
      size: 25,
      page: 1,
      isReordering: false,
      isColumnsCardOpen: false,
      columnName: [],
      isFacetOpen: true,
      facetFilterOpen: [],
      facet:[]
    };
    this.handleAutoCompleteChange = this.handleAutoCompleteChange.bind(this);
    this.handleAutoCompleteSelect = this.handleAutoCompleteSelect.bind(this);
    this.handleAutoCompletePressEnter = this.handleAutoCompletePressEnter.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
    this.getCellRenderer = this.getCellRenderer.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.exportToTsv = this.exportToTsv.bind(this);
    this.handleReordering = this.handleReordering.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this);
    this.handleColumnsViewChange = this.handleColumnsViewChange.bind(this);
    this.handleOpenColumnView = this.handleOpenColumnView.bind(this);
    this.handleRedoViewChange = this.handleRedoViewChange.bind(this);
    this.getCheckColumns = this.getCheckColumns.bind(this);
    this.handleOpenFacet = this.handleOpenFacet.bind(this);
    this.getCardCategoryTitle = this.getCardCategoryTitle.bind(this);
    this.isCategorieFacetOpen = this.isCategorieFacetOpen.bind(this);
    this.changeFacetFilterOpen = this.changeFacetFilterOpen.bind(this);


    // @NOTE Initialize Component State
    const { intl } = props;
    this.state.allColumns = [
      <Column
        key="0"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.status' })}
        cellRenderer={this.getCellRenderer('status', 'status-tag')}
      />,
      <Column
        key="1"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.patientId' })}
        cellRenderer={this.getCellRenderer('id', 'patient-link')}
      />,
      <Column
        key="2"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.mrn' })}
        cellRenderer={this.getCellRenderer('mrn')}
      />,
      <Column
        key="3"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.organization' })}
        cellRenderer={this.getCellRenderer('organization')}
      />,
      <Column
        key="4"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.firstName' })}
        cellRenderer={this.getCellRenderer('firstName', 'bold-string')}
      />,
      <Column
        key="5"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.lastName' })}
        cellRenderer={this.getCellRenderer('lastName', 'bold-string')}
      />,
      <Column
        key="6"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.dob' })}
        cellRenderer={this.getCellRenderer('birthDate', 'bold-string')}
      />,
      <Column
        key="7"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.familyId' })}
        cellRenderer={this.getCellRenderer('familyId')}
      />,
      <Column
        key="8"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.position' })}
        cellRenderer={this.getCellRenderer('proband')}
      />,
      <Column
        key="9"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.practitioner' })}
        cellRenderer={this.getCellRenderer('practitioner')}
      />,
      <Column
        key="10"
        name={intl.formatMessage({ id: 'screen.patientsearch.table.request' })}
        cellRenderer={this.getCellRenderer('request')}
      />,
    ];

    this.state.facet = [
        intl.formatMessage({ id: 'screen.patientsearch.table.practitioner' }),
        intl.formatMessage({ id: 'screen.patientsearch.table.status' }),
        "Category 1",
        "Category 2",
    ]

    this.state.allColumns.map((column) => {
      this.state.columnName.push(column.props.name);
    });

    this.state.visibleColumns = cloneDeep(this.state.allColumns);

    this.state.facetFilterOpen = Array(this.state.columnName.length).fill(false);
  }

  static getDerivedStateFromProps(nextProps, state) {
    const searchType = nextProps.search.lastSearchType || 'patient';
    if (!nextProps.search[searchType].results) {
      return null;
    }

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

      return {
        data,
        page: nextProps.search[searchType].page,
        size: nextProps.search[searchType].pageSize,
      };
    }

    return state;
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
              <Text className="CellValue patientLink">
                <a /* eslint-disable-line */
                  data-patient-id={value}
                  onClick={(e) => {
                    const id = e.currentTarget.attributes['data-patient-id'].nodeValue;
                    actions.navigateToPatientScreen(id);
                  }}
                >
                  {value}
                </a>
              </Text>
            </Cell>
          );
        };

      case 'bold-string':
        return (row) => {
          const { data } = this.state;
          const value = data[row] ? data[row][key] : '';
          return (
            <Cell>
              <Text className="CellValue">{value}</Text>
            </Cell>
          );
        };

      case 'status-tag':
        return (row) => {
          const { data } = this.state;
          const value = data[row] ? data[row][key] : '';
          return (
            <Cell>
              <Row type="flex" align="middle">
                {value && (
                  <div className={value === 'completed' ? 'completed' : 'active'} />
                )}
                <Text className="CellValue">{value}</Text>
              </Row>
            </Cell>
          );
        };

      default:
        return (row) => {
          const { data } = this.state;
          const value = data[row] ? data[row][key] : '';
          return (
            <Cell>
              <Text className="CellValue">{value}</Text>
            </Cell>
          );
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

  handleReordering(e) {
    const { isReordering } = this.state;

    e.target.blur()
    this.setState({
      isReordering: !isReordering,
    });
  }

  handleAutoCompleteChange(query) {
    const { actions } = this.props;
    const { size } = this.state;
    if (query && query.length > 0) {
      actions.autoCompletePatients('partial', query, 1, size);
      this.setState({
        page: 1,
        autoCompleteIsOpen: true,
      });
    } else {
      this.setState({
        page: 1,
      });
      actions.searchPatientsByQuery(null, 1, size);
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
    const { actions } = this.props;
    const query = e.currentTarget.attributes.value.nodeValue;
    this.setState({
      autoCompleteIsOpen: false,
      page: 1,
    });

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
    const { visibleColumns, allColumns } = this.state;
    const nextChildren = Utils.reorderArray(visibleColumns, oldIndex, newIndex, length);
    const nextChildren2 = Utils.reorderArray(allColumns, oldIndex, newIndex, length);
    this.setState({
      visibleColumns: nextChildren,
      allColumns: nextChildren2,
    });
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

  handleSearchByQuery(value) {
    let { allColumns, columnName } = this.state;
    columnName = [];
    allColumns.map((column) => {
      columnName.push(column.props.name);
    });

    const search = value.target.value.toLowerCase();
    const finalResult = columnName.filter(name => name.toLowerCase().startsWith(search));

    this.setState({
      columnName: finalResult,
    });
  }

  handleOpenColumnView(e) {
    const { isColumnsCardOpen } = this.state;

    isColumnsCardOpen ? e.target.blur()  :null

    this.setState({
      isColumnsCardOpen: !isColumnsCardOpen,
    });
  }

  handleColumnsViewChange(checkedValues) {
    const {
      visibleColumns, allColumns, columnName,
    } = this.state;

    const uncheckedColumns = columnName.filter(name => !checkedValues.includes(name));
    const toRemove = filter(visibleColumns, column => uncheckedColumns.includes(column.props.name));
    pullAllBy(visibleColumns, toRemove, 'key');

    const check = this.getCheckColumns();
    const toAdd = checkedValues.filter(name => !check.includes(name));
    const addColumn = find(allColumns, column => toAdd.includes(column.props.name));
    const index = findIndex(allColumns, addColumn);
    addColumn ? visibleColumns.splice(index, 0, addColumn) : null;

    this.setState({
      visibleColumns,
    });
  }

  handleRedoViewChange() {
    let { visibleColumns, allColumns, columnName } = this.state;

    columnName = [];
    allColumns.map((column) => {
      columnName.push(column.props.name);
    });

    visibleColumns = cloneDeep(allColumns);
    this.setState({
      visibleColumns,
      columnName,
    });
  }

  getCheckColumns() {
    const { visibleColumns } = this.state;
    const check = [];
    visibleColumns.map(column => check.push(column.props.name));
    return check;
  }

  handleOpenFacet() {
    const { isFacetOpen } = this.state;

    this.setState({
      isFacetOpen: !isFacetOpen,
    });
  }

  getCardCategoryTitle(name, index) {
    const open = this.isCategorieFacetOpen(index);
    return (
      <a onClick={this.changeFacetFilterOpen.bind(null, index)} key={index}>
        {!open ? <IconKit size={24} icon={ic_keyboard_arrow_right} /> : <IconKit size={24} icon={ic_keyboard_arrow_down} />}
        {name}
      </a>
    );
  }

  changeFacetFilterOpen(index) {
    const { facetFilterOpen } = this.state;

    facetFilterOpen[index] = !facetFilterOpen[index];
    this.setState({
      facetFilterOpen,
    });
  }

  isCategorieFacetOpen(index) {
    const { facetFilterOpen } = this.state;
    return facetFilterOpen[index];
  }

  render() {
    const { intl, search } = this.props;
    const { patient } = search;
    const { total } = patient;
    const {
      allColumns, autoCompleteIsOpen, size, page, isReordering, columnName, visibleColumns, isColumnsCardOpen, isFacetOpen,facet
    } = this.state;
    const { Title } = Typography;
    const placeholderText = intl.formatMessage({ id: 'screen.patientsearch.placeholder' });
    const downloadText = intl.formatMessage({ id: 'screen.patientsearch.download' });
    const paginationText = intl.formatMessage({ id: 'screen.patientsearch.pagination' });
    const current = ((page - 1) * size) + 1;
    const pageTotal = size * page;
    const checkColumns = this.getCheckColumns();

    const cardInputTitle = (
      <Input
        placeholder="Rechercher..."
        suffix={<IconKit size={16} icon={ic_search} />}
        onChange={this.handleSearchByQuery}
      />
    );
    const overlay = (
      <Popover visible>
        <Card title={cardInputTitle} className="columnFilter" bordered={false}>
          { !isEqual(allColumns, visibleColumns) && (
            <Row>
              <a className="reinitialiser" onClick={this.handleRedoViewChange}>
                        Réinitialiser
                <IconKit size={16} icon={ic_replay} />
              </a>
            </Row>
          )
          }

          <Row>
            <Checkbox.Group className="checkbox" defaultValue={columnName} onChange={this.handleColumnsViewChange} option={columnName} value={checkColumns}>
              {columnName.map((name, index) => (
                <Row key={index}>
                  <Col>
                    <Checkbox value={name}>{name}</Checkbox>
                  </Col>
                </Row>
              ))}
            </Checkbox.Group>
          </Row>
        </Card>
      </Popover>
    );


    return (
      <Content>
        <Header />
        <Card className="patientSearch">
          <Row>
            <Col span={24}>
              <Title level={3}>Liste des patients</Title>
            </Col>
          </Row>
          <Row type="flex" justify="space-between" className="searchNav">
            <Col>
              <Button className={`${style.btn} filter`} style={isFacetOpen ? { width: 280 } : { width: 'auto' }} onClick={this.handleOpenFacet}>
                <div>
                  <IconKit size={16} icon={ic_tune} />
                  Filtrer
                </div>
                { isFacetOpen && (
                     <IconKit size={16} icon={ic_close} />
                )
                }
              </Button>
            </Col>
            <Col className="autoSearch">
              <AutoComplete
                size="large"
                style={{ width: '100%' }}
                optionLabelProp="text"
                placeholder={placeholderText}
                allowClear
                autoFocus
                defaultActiveFirstOption={false}
                dataSource={search.autocomplete.results}
                onChange={this.handleAutoCompleteChange}
                onSelect={this.handleAutoCompleteSelect}
                open={autoCompleteIsOpen}

              >
                <Input prefix={<Icon type="search" />} onPressEnter={this.handleAutoCompletePressEnter} />
              </AutoComplete>
            </Col>
            <Col>
              <Button className={`${style.btnBlue} ${style.btn}`}>
                <IconKit size={16} icon={ic_add} />
                Nouveau patient
              </Button>
            </Col>
          </Row>


          <Row type="flex" justify="space-between">
            { isFacetOpen && (
            <Col className={isFacetOpen ? 'openFacet' : 'closeFacet'}>
              {facet.map((column, index) => (
                <Card bordered={false} className="category" title={this.getCardCategoryTitle(column, index)}>
                  {
                      this.isCategorieFacetOpen(index) && (
                      <Checkbox.Group className="checkbox" defaultValue={columnName} >
                        {columnName.map((name, index) => (
                          <Row key={index}>
                            <Col>
                              <Checkbox value={name}>{name}</Checkbox>
                            </Col>
                          </Row>
                        ))}
                      </Checkbox.Group>
                      )
                   }
                </Card>
              ))
                 }

            </Col>

            )}

            <Col className={isFacetOpen ? 'table table-facet' : 'table'}>
              <Card bordered={false} className="tablePatient">
                <Row type="flex" justify="end" className="controls">
                  <Col>
                    <Button
                      onClick={this.handleReordering}
                      className={isReordering ? `reorder ${style.btnSec} ${style.btn}` : `${style.btnSec}  ${style.btn}`}
                    >
                      <IconKit size={16} icon={ic_swap_horiz} />
                        Organiser
                    </Button>
                  </Col>
                  <Col>
                    <Dropdown overlay={overlay} trigger="click" visible={isColumnsCardOpen} placement="bottomRight">
                      <Button
                        onClick={this.handleOpenColumnView}
                        className={`${style.btn} ${style.btnSec}`}
                      >
                        <IconKit size={16} icon={ic_view_column} />
                            Afficher
                      </Button>
                    </Dropdown>
                  </Col>
                  <Col>
                    <Button
                      onClick={this.exportToTsv}
                      className={`${style.btn} ${style.btnSec}`}
                    >
                      <IconKit size={16} icon={ic_cloud_download} />
                        Exporter
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Table
                      numRows={(size <= total ? size : total)}
                      enableColumnReordering={isReordering}
                      enableColumnResizing
                      onColumnsReordered={this.handleColumnsReordered}
                      bodyContextMenuRenderer={renderBodyContextMenu}
                      renderMode={RenderMode.NONE}
                      enableGhostCells
                      className="patientTable"
                    >
                      { visibleColumns.map(column => (column)) }
                    </Table>
                  </Col>
                </Row>
                <br />
                <Row type="flex" justify="space-between" align="middle">

                  <Col align="start">
                    <Typography>
                      { format(paginationText, current, (pageTotal <= total ? pageTotal : total), total) }
                    </Typography>
                  </Col>
                  <Col align="end">
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
