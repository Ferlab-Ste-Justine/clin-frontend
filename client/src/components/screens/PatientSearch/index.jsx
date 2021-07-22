import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, AutoComplete, Row, Col, Input, Typography, Button, Menu, Divider, Checkbox, Tabs,
} from 'antd';
import { ExportToCsv } from 'export-to-csv';
import IconKit from 'react-icons-kit';
import {
  ic_keyboard_arrow_right, ic_search, ic_keyboard_arrow_down,
} from 'react-icons-kit/md';
import { SearchOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import './style.scss';

import PatientCreation from '../PatientCreation';
import { searchShape } from '../../../reducers/search';
import { navigateToPatientScreen, navigateToSubmissionScreen } from '../../../actions/router';
import {
  autoCompletePatients, searchPatientsByQuery, autoCompletePatientsSelected, changeSearchType,
} from '../../../actions/patient';
import { updateUserColumns, updateUserColumnsOrder, updateUserColumnsReset } from '../../../actions/user';
import { generateNanuqReport } from '../../../actions/nanuq';
import { appShape } from '../../../reducers/app';
import Layout from '../../Layout';
import PrescriptionTable from './components/PrescriptionTable';
import PatientTable from './components/PatientTable';
import api from '../../../helpers/api';

class PatientSearchScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      size: 25,
      page: 1,
      isFacetOpen: false,
      facetFilterOpen: [],
      facet: [],
      columnPreset: [],
      autocompletePrescription: null,
    };
    this.handleAutoCompleteChange = debounce(this.handleAutoCompleteChange.bind(this), 250, { leading: true });
    this.handleAutoCompleteSelect = this.handleAutoCompleteSelect.bind(this);
    this.handleAutoCompletePressEnter = this.handleAutoCompletePressEnter.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.exportToTsv = this.exportToTsv.bind(this);
    this.handleOpenFacet = this.handleOpenFacet.bind(this);
    this.isCategorieFacetOpen = this.isCategorieFacetOpen.bind(this);
    this.handleGoToPatientScreen = this.handleGoToPatientScreen.bind(this);
    this.getValue = this.getValue.bind(this);
    this.getData = this.getData.bind(this);
    this.handleCategoriesOpenChange = this.handleCategoriesOpenChange.bind(this);
    this.handleGotoSubmissionPage = this.handleGotoSubmissionPage.bind(this);
    this.handleColumnsUpdated = this.handleColumnsUpdated.bind(this);
    this.handleColumnsOrderUpdated = this.handleColumnsOrderUpdated.bind(this);
    this.handleColumnsReset = this.handleColumnsReset.bind(this);

    // @NOTE Initialize Component State
    this.state.facet = [
      'practitioner',
      'status',
      'familyComposition',
      'position',
      'organization',
    ];
    const { columnPreset } = this.state;
    this.state.facetFilterOpen = Array(columnPreset.length).fill(false);
  }

  getData() {
    const { data, size } = this.state;
    return data.slice(0, size);
  }

  getValue(type) {
    const { data } = this.state;
    let value = [];
    if (type === 'practitioner') {
      data.map((d) => (
        !value.includes(d.practitioner) ? value.push(d.practitioner) : null
      ));
    } else if (type === 'status') {
      data.map((d) => (
        !value.includes(d.status) ? value.push(d.status) : null
      ));
    } else if (type === 'familyComposition') {
      value = ['solo', 'duo', 'trio'];
    } else if (type === 'position') {
      value = ['Proband', 'Parent'];
    } else if (type === 'organization') {
      data.map((d) => (
        !value.includes(d.organization) ? value.push(d.organization) : null
      ));
    }

    return value;
  }

  handleCategoriesOpenChange(e) {
    this.setState({
      facetFilterOpen: e,
    });
  }

  async handleAutoCompletePressEnter(e) {
    const { size, page } = this.state;
    const { actions, search } = this.props;
    const query = e.currentTarget.attributes.value.nodeValue;
    async function getPrescription(searchTerm) {
      const response = await api.getPrescriptionsByAutoComplete('partial', searchTerm, page, size);
      return response;
    }
    this.setState({
      page: 1,
    });
    if (!query || query.length < 1) {
      actions.searchPatientsByQuery({}, 1, size);
    } else if (search.type === 'prescriptions') {
      getPrescription(query).then((result) => {
        this.setState({
          autocompletePrescription: result.payload.data.data,
        });
      });
    } else {
      actions.autoCompletePatients('complete', query, 1, size);
    }
  }

  handlePageChange(page, size) {
    const { actions, search } = this.props;
    const { autocompletePrescription } = this.state;
    async function getPrescription(searchTerm) {
      const response = await api.getPrescriptionsByAutoComplete('partial', searchTerm, page, size);
      return response;
    }
    this.setState({
      page,
    });
    if (autocompletePrescription) {
      getPrescription(search.autocomplete.query).then((result) => {
        this.setState({
          autocompletePrescription: result.payload.data.data,
        });
      });
    }
    if (search.lastSearchType === 'autocomplete') {
      actions.autoCompletePatients('partial', search.autocomplete.query, page, size);
    } else {
      actions.searchPatientsByQuery(search.patient.query, page, size);
    }
  }

  handleColumnsUpdated(columns) {
    if (columns != null) {
      const { actions } = this.props;
      const indexSelect = columns.indexOf('screen.patientsearch.table.select');
      if (indexSelect === -1) {
        columns.unshift('screen.patientsearch.table.select');
      }
      actions.updateUserColumns(columns);
    }
  }

  handleColumnsOrderUpdated(columns) {
    if (columns != null) {
      const { actions } = this.props;
      actions.updateUserColumnsOrder(columns);
    }
  }

  handleColumnsReset() {
    const { actions } = this.props;
    actions.updateUserColumnsReset();
  }

  handlePageSizeChange(size) {
    const { actions, search } = this.props;
    const { page } = this.state;
    const { autocompletePrescription } = this.state;
    this.setState({
      size,
    });

    async function getPrescription(searchTerm) {
      const response = await api.getPrescriptionsByAutoComplete('partial', searchTerm, page, size);
      return response;
    }

    if (autocompletePrescription) {
      getPrescription(search.autocomplete.query).then((result) => {
        this.setState({
          autocompletePrescription: result.payload.data.data,
        });
      });
    }
    if (search.lastSearchType === 'autocomplete') {
      actions.autoCompletePatients('partial', search.autocomplete.query, page, size);
    } else {
      actions.searchPatientsByQuery(search.patient.query, page, size);
    }
  }

  handleOpenFacet() {
    const { isFacetOpen, columnsWidth } = this.state;

    this.setState({
      isFacetOpen: !isFacetOpen,
      columnsWidth: columnsWidth || 120,
    });
  }

  handleAutoCompleteChange(query) {
    const { actions } = this.props;
    const { size } = this.state;
    if (query && query.length > 0) {
      actions.autoCompletePatients('partial', query, 1, size);
      this.setState({
        page: 1,
      });
    } else {
      this.setState({
        page: 1,
        autocompletePrescription: null,
      });
      actions.autoCompletePatients('partial', null, 1, size);
      actions.searchPatientsByQuery(null, 1, size);
    }
  }

  handleAutoCompleteSelect(value) {
    const { actions } = this.props;
    const patientId = value.split(' ')[0] || null;
    if (patientId) {
      actions.autoCompletePatientsSelected();
      actions.navigateToPatientScreen(patientId);
    }
  }

  handleGoToPatientScreen(patientId, requestId) {
    const { actions } = this.props;
    actions.navigateToPatientScreen(patientId, {
      openedPrescriptionId: requestId,
    });
  }

  handleGotoSubmissionPage() {
    const { actions } = this.props;
    actions.navigateToSubmissionScreen();
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

  isCategorieFacetOpen(index) {
    const { facetFilterOpen } = this.state;
    return !!facetFilterOpen.includes(index);
  }

  render() {
    const {
      app, search, defaultColumns, defaultColumnsOrder, actions,
    } = this.props;
    const { showSubloadingAnimation } = app;
    const {
      isFacetOpen, facet, size, page, autocompletePrescription,
    } = this.state;
    const { Title } = Typography;
    const { SubMenu } = Menu;
    const placeholderText = intl.get('screen.patientsearch.placeholder');
    const selectAll = intl.get('screen.patientvariant.filter.selection.all');
    const selectNone = intl.get('screen.patientvariant.filter.selection.none');

    const autoCompleteResults = search.autocomplete.results.map((result) => ({
      value: result.id,
      text: (
        <>
          <Row className="autocomplete-row">
            <Col>
              <Typography.Text className="autocomplete-row__name">
                { result.lastName.toUpperCase() } { result.firstName }
              </Typography.Text>
            </Col>
            <Col>
              <Typography.Text className="autocomplete-row__mrn">
                { intl.get('screen.patientsearch.table.mrn') }: { result.mrn }
              </Typography.Text>
            </Col>
          </Row>
        </>
      ),
    }));
    return (
      <Layout>
        <div className="page_headerStaticNoMargin">
          <div className="variant-page-content__header">
            <Title level={3}>{ intl.get('screen.patientsearch.title') }</Title>
          </div>
        </div>
        <Card className="patientSearch" bordered={false}>
          <Row justify="space-between" className="flex-row searchNav">
            <Col className="autoSearch">
              <AutoComplete
                style={{ width: '100%' }}
                allowClear
                autoFocus
                defaultActiveFirstOption={false}
                dataSource={autoCompleteResults}
                onChange={this.handleAutoCompleteChange}
                onSelect={this.handleAutoCompleteSelect}
                onBlur={this.handleAutoCompleteClose}
                className="autocomplete"
              >
                <Input
                  prefix={
                    <SearchOutlined />
                  }
                  placeholder={placeholderText}
                  onPressEnter={this.handleAutoCompletePressEnter}
                />
              </AutoComplete>
            </Col>
            <Col>
              <PatientCreation />
            </Col>
          </Row>
          <Row className="flex-row">
            { isFacetOpen && (
              <Col className={isFacetOpen ? 'openFacet' : 'closeFacet'}>
                <Menu
                  onClick={this.handleClick}
                  mode="inline"
                  className="menuCaterogy"
                  onOpenChange={this.handleCategoriesOpenChange}
                >{
                    facet.map((type) => (
                      <SubMenu
                        className="category"
                        key={type}
                        title={(
                          <span className="subMenuTitle">
                            <IconKit size={24} icon={this.isCategorieFacetOpen(type) ? ic_keyboard_arrow_down : ic_keyboard_arrow_right} className="iconRightArrowDropDown" />
                            <div className="titleName">
                              <span className="value">{ intl.get(`screen.patientsearch.table.${type}`) }</span>
                              {
                                this.isCategorieFacetOpen(type) ? (
                                  <Button className="iconSearch" onClick={this.handleInputView}>
                                    <IconKit size={24} icon={ic_search} />
                                  </Button>
                                ) : null
                              }

                            </div>
                          </span>
                        )}
                      >
                        <Card bordered={false}>
                          <Row className="selectionToolBar">
                            <Button onClick={this.handleSelectAll}>{ selectAll }</Button>
                            <Divider type="vertical" />
                            <Button onClick={this.handleSelectNone}>{ selectNone }</Button>
                          </Row>
                          <Row>
                            <Col span={24}>
                              <Checkbox.Group className="checkboxGroup" onChange={this.handleSelectionChange}>
                                { this.getValue(type).map((option) => (
                                  <Row>
                                    <Col>
                                      <Checkbox className="checkboxLabel" value={option}><span className="checkboxValue">{ option }</span></Checkbox>
                                    </Col>
                                  </Row>
                                )) }
                              </Checkbox.Group>
                            </Col>
                          </Row>
                        </Card>
                      </SubMenu>
                    ))
                  }
                </Menu>
              </Col>
            ) }
            <Col className={isFacetOpen ? 'table table-facet' : 'table'}>
              <Card bordered={false} className="tablePatient">
                <Tabs
                  className="patientSearch__tabs"
                  activeKey={search.type}
                  onChange={(key) => {
                    actions.changeSearchType(key);
                    this.setState({
                      page: 1,
                    });
                  }}
                >
                  <Tabs.TabPane
                    key="prescriptions"
                    tab={(
                      <span className="tabName">
                        { intl.get('screen.patientsearch.tabs.prescriptions') }
                      </span>
                    )}
                  >
                    { defaultColumns != null && (
                      <PrescriptionTable
                        size={size}
                        page={page}
                        searchProps={search}
                        defaultVisibleColumns={defaultColumns}
                        defaultColumnsOrder={defaultColumnsOrder}
                        pageChangeCallback={this.handlePageChange}
                        pageSizeChangeCallback={this.handlePageSizeChange}
                        exportCallback={this.exportToTsv}
                        isLoading={showSubloadingAnimation}
                        columnsUpdated={this.handleColumnsUpdated}
                        columnsOrderUpdated={this.handleColumnsOrderUpdated}
                        columnsReset={this.handleColumnsReset}
                      />
                    ) }
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={intl.get('screen.patientsearch.tabs.patients')} key="patients">
                    { defaultColumns != null && (
                      <PatientTable
                        size={size}
                        page={page}
                        searchProps={search}
                        autocompleteResults={autocompletePrescription}
                        defaultVisibleColumns={defaultColumns}
                        defaultColumnsOrder={defaultColumnsOrder}
                        pageChangeCallback={this.handlePageChange}
                        pageSizeChangeCallback={this.handlePageSizeChange}
                        exportCallback={this.exportToTsv}
                        isLoading={showSubloadingAnimation}
                        columnsUpdated={this.handleColumnsUpdated}
                        columnsOrderUpdated={this.handleColumnsOrderUpdated}
                        columnsReset={this.handleColumnsReset}
                      />
                    ) }
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
        </Card>
      </Layout>
    );
  }
}

PatientSearchScreen.propTypes = {
  app: PropTypes.shape(appShape).isRequired,
  search: PropTypes.shape(searchShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
  defaultColumns: PropTypes.array.isRequired,
  defaultColumnsOrder: PropTypes.array.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    navigateToPatientScreen,
    navigateToSubmissionScreen,
    autoCompletePatients,
    searchPatientsByQuery,
    autoCompletePatientsSelected,
    updateUserColumns,
    updateUserColumnsOrder,
    updateUserColumnsReset,
    generateNanuqReport,
    changeSearchType,
  }, dispatch),
});

const mapStateToProps = (state) => ({
  app: state.app,
  search: state.search,
  defaultColumns: state.search.columns,
  defaultColumnsOrder: state.search.columnsOrder,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientSearchScreen);
