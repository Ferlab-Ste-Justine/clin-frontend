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
  ic_keyboard_arrow_right, ic_tune, ic_close, ic_search, ic_keyboard_arrow_down,
} from 'react-icons-kit/md';
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import style from '../../../containers/App/style.module.scss';
import './style.scss';

import PatientCreation from '../PatientCreation';
import { createCellRenderer } from '../../Table/index';
import InteractiveTable from '../../Table/InteractiveTable';
import { searchShape } from '../../../reducers/search';
import { navigateToPatientScreen, navigateToSubmissionScreen } from '../../../actions/router';
import {
  autoCompletePatients, searchPatientsByQuery, autoCompletePatientsSelected, changeSearchType,
} from '../../../actions/patient';
import { updateUserColumns, updateUserColumnsOrder, updateUserColumnsReset } from '../../../actions/user';
import { generateNanuqReport } from '../../../actions/nanuq';
import { appShape } from '../../../reducers/app';
import Layout from '../../Layout';

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
      selectedPatients: [],
      columnPreset: [],
      handleGoToPatientScreen: this.handleGoToPatientScreen.bind(this),
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

  static getDerivedStateFromProps(nextProps, state) {
    const newState = { ...state };
    let { columnPreset } = state;

    const searchType = nextProps.search.lastSearchType || 'patient';
    if (!nextProps.search[searchType].results) {
      return null;
    }

    const getStatusLabel = (req) => {
      if (req.status === 'on-hold' && !req.submitted) {
        return intl.get('screen.patientsearch.status.incomplete');
      }
      return intl.get(`screen.patientsearch.status.${req.status}`);
    };

    if (searchType !== 'autocomplete') {
      const output = [];
      if (nextProps.search.type === 'prescriptions') {
        nextProps.search[searchType].results
          .filter((result) => result != null && result.patientInfo != null)
          .forEach((result) => {
            const organizationValue = () => {
              if (result.patientInfo.organization.name === '') {
                return result.patientInfo.organization.id.split('/')[1];
              }
              return result.patientInfo.organization.name;
            };
            const value = {
              status: getStatusLabel(result),
              id: result.patientInfo.id,
              mrn: result.patientInfo.mrn[0],
              ramq: result.patientInfo.ramq,
              organization: organizationValue(),
              firstName: result.patientInfo.firstName,
              lastName: result.patientInfo.lastName.toUpperCase(),
              gender: intl.get(`screen.patientsearch.${result.patientInfo.gender.toLowerCase()}`),
              birthDate: result.patientInfo.birthDate,
              familyId: result.familyInfo.id,
              familyComposition: result.familyInfo.type,
              familyType: result.familyInfo.type,
              ethnicity: result.ethnicity,
              bloodRelationship: result.bloodRelationship,
              proband: 'Proband',
              position: result.patientInfo.position,
              practitioner: result.practitioner.id.startsWith('PA') ? `${result.practitioner.lastName.toUpperCase()}, ${result.practitioner.firstName}` : 'FERRETTI, Vincent',
              request: result.id,
              test: result.test,
              prescription: result.authoredOn,
              fetus: result.patientInfo.fetus,
            };

            Object.keys(value).forEach((key) => {
              if (value[key] == null || value[key].length === 0) {
                value[key] = '--';
              }
            });
            output.push(value);
          });

        columnPreset = [
          {
            key: 'patientId',
            label: 'screen.patientsearch.table.patientId',
            renderer: createCellRenderer('custom', (() => output), {
              renderer: (data) => (
                <Button
                  onClick={() => state.handleGoToPatientScreen(data.id)}
                  data-id={data.request}
                  className="button link--underline"
                >
                  { data.id }
                </Button>
              ),
            }),
          },
          {
            key: 'organization',
            label: 'screen.patientsearch.table.organization',
            renderer: createCellRenderer('text', (() => output), { key: 'organization' }),
          },
          {
            key: 'lastName',
            label: 'screen.patientsearch.table.lastName',
            renderer: createCellRenderer('text', (() => output), { key: 'lastName' }),
          },
          {
            key: 'firstName',
            label: 'screen.patientsearch.table.firstName',
            renderer: createCellRenderer('custom', (() => output), {
              renderer: (data) => {
                try {
                  const name = data.fetus ? intl.get('screen.patient.table.fetus') : data.firstName;
                  return name;
                } catch (e) { return ''; }
              },
            }),
          },
          {
            key: 'gender',
            label: 'screen.patientsearch.table.gender',
            renderer: createCellRenderer('text', (() => output), { key: 'gender' }),
          },
          {
            key: 'dob',
            label: 'screen.patientsearch.table.dob',
            renderer: createCellRenderer('text', (() => output), { key: 'birthDate' }),
          },
          {
            key: 'practitioner',
            label: 'screen.patientsearch.table.practitioner',
            renderer: createCellRenderer('text', (() => output), { key: 'practitioner' }),
          },
          {
            key: 'test',
            label: 'screen.patientsearch.table.test',
            renderer: createCellRenderer('text', (() => output), { key: 'test' }),
          },
          {
            key: 'prescription',
            label: 'screen.patientsearch.table.prescription',
            renderer: createCellRenderer('text', (() => output), { key: 'prescription' }),
          },
          {
            key: 'mrn',
            label: 'screen.patientsearch.table.mrn',
            renderer: createCellRenderer('text', (() => output), { key: 'mrn' }),
          },
          {
            key: 'ramq',
            label: 'screen.patientsearch.table.ramq',
            renderer: createCellRenderer('text', (() => output), { key: 'ramq' }),
          },
          {
            key: 'position',
            label: 'screen.patientsearch.table.position',
            renderer: createCellRenderer('text', (() => output), { key: 'position' }),
          },
          {
            key: 'familyId',
            label: 'screen.patientsearch.table.familyId',
            renderer: createCellRenderer('text', (() => output), { key: 'familyId' }),
          },
          {
            key: 'familyType',
            label: 'screen.patientsearch.table.familyType',
            renderer: createCellRenderer('text', (() => output), { key: 'familyType' }),
          },
          {
            key: 'ethnicity',
            label: 'screen.patientsearch.table.ethnicity',
            renderer: createCellRenderer('text', (() => output), { key: 'ethnicity' }),
          },
          {
            key: 'bloodRelationship',
            label: 'screen.patientsearch.table.bloodRelationship',
            renderer: createCellRenderer('text', (() => output), { key: 'bloodRelationship' }),
          },
          {
            key: 'status',
            label: 'screen.patientsearch.table.status',
            renderer: createCellRenderer('dot', () => output, {
              key: 'status',
              renderer: (value) => {
                switch (value) {
                  case intl.get('screen.patientsearch.status.draft'):
                    return '#D2DBE4';
                  case intl.get('screen.patientsearch.status.on-hold'):
                    return '#D46B08';
                  case intl.get('screen.patientsearch.status.active'):
                    return '#1D8BC6';
                  case intl.get('screen.patientsearch.status.revoked'):
                    return '#CF1322';
                  case intl.get('screen.patientsearch.status.completed'):
                    return '#389E0D';
                  case intl.get('screen.patientsearch.status.incomplete'):
                    return '#EB2F96';
                    // empty rows
                  case '':
                    return 'transparent';
                  default:
                    return 'transparent';
                }
              },
            }),
          },
          {
            key: 'request',
            label: 'screen.patientsearch.table.request',
            renderer: createCellRenderer('custom', () => output, {
              renderer: (presetData) => (
                <Button
                  onClick={() => state.handleGoToPatientScreen(presetData.id, presetData.request)}
                  data-id={presetData.request}
                  className="button link--underline"
                >
                  { presetData.request }
                </Button>
              ),
            }),
          },
        ];
      } else {
        columnPreset = [
          {
            key: 'patientId',
            label: 'screen.patientsearch.table.patientId',
            renderer: createCellRenderer('custom', (() => output), {
              renderer: (data) => (
                <Button
                  onClick={() => state.handleGoToPatientScreen(data.id)}
                  data-id={data.request}
                  className="button link--underline"
                >
                  { data.id }
                </Button>
              ),
            }),
          },
          {
            key: 'organization',
            label: 'screen.patientsearch.table.organization',
            renderer: createCellRenderer('text', (() => output), { key: 'organization' }),
          },
          {
            key: 'lastName',
            label: 'screen.patientsearch.table.lastName',
            renderer: createCellRenderer('text', (() => output), { key: 'lastName' }),
          },
          {
            key: 'firstName',
            label: 'screen.patientsearch.table.firstName',
            renderer: createCellRenderer('custom', (() => output), {
              renderer: (data) => {
                try {
                  const name = data.fetus ? intl.get('screen.patient.table.fetus') : data.firstName;
                  return name;
                } catch (e) { return ''; }
              },
            }),
          },
          {
            key: 'gender',
            label: 'screen.patientsearch.table.gender',
            renderer: createCellRenderer('text', (() => output), { key: 'gender' }),
          },
          {
            key: 'dob',
            label: 'screen.patientsearch.table.dob',
            renderer: createCellRenderer('text', (() => output), { key: 'birthDate' }),
          },
          {
            key: 'practitioner',
            label: 'screen.patientsearch.table.practitioner',
            renderer: createCellRenderer('text', (() => output), { key: 'practitioner' }),
          },
          {
            key: 'test',
            label: 'screen.patientsearch.table.test',
            renderer: createCellRenderer('text', (() => output), { key: 'test' }),
          },
          {
            key: 'prescription',
            label: 'screen.patientsearch.table.prescription',
            renderer: createCellRenderer('text', (() => output), { key: 'prescription' }),
          },
          {
            key: 'mrn',
            label: 'screen.patientsearch.table.mrn',
            renderer: createCellRenderer('text', (() => output), { key: 'mrn' }),
          },
          {
            key: 'ramq',
            label: 'screen.patientsearch.table.ramq',
            renderer: createCellRenderer('text', (() => output), { key: 'ramq' }),
          },
          {
            key: 'position',
            label: 'screen.patientsearch.table.position',
            renderer: createCellRenderer('text', (() => output), { key: 'position' }),
          },
          {
            key: 'familyId',
            label: 'screen.patientsearch.table.familyId',
            renderer: createCellRenderer('text', (() => output), { key: 'familyId' }),
          },
          {
            key: 'familyType',
            label: 'screen.patientsearch.table.familyType',
            renderer: createCellRenderer('text', (() => output), { key: 'familyType' }),
          },
        ];
        nextProps.search[searchType].results
          .filter((result) => result != null && result.organization != null)
          .forEach((result) => {
            const organizationValue = () => {
              if (result.organization.name === '') {
                return result.organization.id.split('/')[1];
              }
              return result.organization.name;
            };
            const value = {
              status: '--',
              id: result.id,
              mrn: result.mrn,
              ramq: result.ramq,
              organization: organizationValue(),
              firstName: result.firstName,
              lastName: result.lastName.toUpperCase(),
              gender: intl.get(`screen.patientsearch.${result.gender.toLowerCase()}`),
              birthDate: result.birthDate,
              familyId: result.familyId,
              familyComposition: '',
              familyType: result.familyType,
              ethnicity: result.ethnicity,
              bloodRelationship: result.bloodRelationship,
              proband: result.proband,
              position: result.position,
              practitioner: result.id.startsWith('PA') ? `${result.practitioner.lastName.toUpperCase()}, ${result.practitioner.firstName}` : 'FERRETTI, Vincent',
              request: result.request,
              test: result.test,
              prescription: result.prescription,
              fetus: result.fetus,
            };

            Object.keys(value).forEach((key) => {
              if (value[key] == null || value[key].length === 0) {
                value[key] = '--';
              }
            });
            output.push(value);
          });
      }

      return {
        data: output,
        columnPreset,
        page: nextProps.search[searchType].page,
        size: nextProps.search[searchType].pageSize,
        totalLength: output.length,
      };
    }

    return newState;
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

  handleAutoCompletePressEnter(e) {
    const { size } = this.state;
    const { actions } = this.props;
    const query = e.currentTarget.attributes.value.nodeValue;
    this.setState({
      page: 1,
    });

    if (!query || query.length < 1) {
      actions.searchPatientsByQuery({}, 1, size);
    } else {
      actions.autoCompletePatients('complete', query, 1, size);
    }
  }

  handlePageChange(page, size) {
    const { actions, search } = this.props;
    this.setState({
      page,
    });

    if (search.lastSearchType === 'autocomplete') {
      actions.autoCompletePatients('partial', search.autocomplete.query, page, size);
    } else {
      actions.searchPatientsByQuery(search.patient.query, page, size);
    }
  }

  handleColumnsUpdated(columns) {
    if (columns != null) {
      const { actions } = this.props;
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
    this.setState({
      size,
    });

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
    const { patient } = search;
    const { total } = patient;
    const {
      size, page, isFacetOpen, facet, selectedPatients, totalLength, columnPreset,
    } = this.state;

    const { Title } = Typography;
    const { SubMenu } = Menu;
    const placeholderText = intl.get('screen.patientsearch.placeholder');
    const selectAll = intl.get('screen.patientvariant.filter.selection.all');
    const selectNone = intl.get('screen.patientvariant.filter.selection.none');

    const rowHeights = Array(size).fill(36);
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
            <Col>
              <Button className={isFacetOpen ? 'facet openFacet' : 'facet'} onClick={this.handleOpenFacet}>
                <div>
                  <IconKit className="btnIcon" size={16} icon={ic_tune} />
                  { intl.get('screen.patientsearch.filter') }
                </div>
                { isFacetOpen && (
                  <IconKit className="btnClose" size={16} icon={ic_close} />
                ) }
              </Button>
            </Col>
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
                { defaultColumns != null && (
                  <InteractiveTable
                    key="patient-interactive-table"
                    size={size}
                    page={page}
                    total={total}
                    totalLength={totalLength}
                    defaultVisibleColumns={defaultColumns}
                    defaultColumnsOrder={defaultColumnsOrder}
                    schema={columnPreset}
                    columnWidth={columnPreset.map((c) => c.columnWidth)}
                    pageChangeCallback={this.handlePageChange}
                    pageSizeChangeCallback={this.handlePageSizeChange}
                    exportCallback={this.exportToTsv}
                    numFrozenColumns={2}
                    isLoading={showSubloadingAnimation}
                    rowHeights={rowHeights}
                    columnsUpdated={this.handleColumnsUpdated}
                    columnsOrderUpdated={this.handleColumnsOrderUpdated}
                    columnsReset={this.handleColumnsReset}
                    customHeader={(
                      <Row align="middle" gutter={32}>
                        <Tabs
                          className="patientSearch__tabs"
                          activeKey={search.type}
                          onChange={(key) => {
                            actions.changeSearchType(key);
                          }}
                        >
                          <Tabs.TabPane tab={intl.get('screen.patientsearch.tabs.prescriptions')} key="prescriptions" />
                          <Tabs.TabPane tab={intl.get('screen.patientsearch.tabs.patients')} key="patients" />
                        </Tabs>
                        { selectedPatients.length > 0 && (
                          <>
                            <Col>
                              <Typography.Text> {
                                intl.get('screen.patientsearch.table.selectedPatients',
                                  { count: selectedPatients.length })
                              }
                              </Typography.Text>
                            </Col>
                          </>
                        ) }
                        <Col flex={1} className="patientSearch__table__header__nanuq">
                          <Button
                            className={[style.btn, style.btnSec].join(' ')}
                            disabled={selectedPatients.length === 0}
                            onClick={() => actions.generateNanuqReport(selectedPatients)}
                          >
                            <FileTextOutlined />
                            { intl.get('screen.patientsearch.table.nanuq') }
                          </Button>
                          <Divider type="vertical" />
                        </Col>
                      </Row>
                    )}
                  />
                ) }
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
