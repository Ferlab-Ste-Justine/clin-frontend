import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, AutoComplete, Row, Col, Input, Icon, Typography, Button, Menu, Divider, Checkbox,
} from 'antd';
import { ExportToCsv } from 'export-to-csv';
import IconKit from 'react-icons-kit';
import {
  ic_add, ic_keyboard_arrow_right, ic_tune, ic_close, ic_search, ic_keyboard_arrow_down,
} from 'react-icons-kit/md';
import {
  debounce,
} from 'lodash';

import './style.scss';
import style from '../../../containers/App/style.module.scss';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import { createCellRenderer } from '../../Table/index';
import InteractiveTable from '../../Table/InteractiveTable';
import { searchShape } from '../../../reducers/search';
import { navigateToPatientScreen, navigateToSoumissionScreen } from '../../../actions/router';
import { autoCompletePatients, searchPatientsByQuery } from '../../../actions/patient';
import { appShape } from '../../../reducers/app';

const COLUMN_WIDTHS = {
  DEFAULT: 150,
};

class PatientSearchScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      size: 25,
      page: 1,
      isFacetOpen: false,
      facetFilterOpen: [],
      facet: [],
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
    this.handleGotoSoumissionPage = this.handleGotoSoumissionPage.bind(this);

    // @NOTE Initialize Component State
    this.state.facet = [
      'practitioner',
      'status',
      'familyComposition',
      'position',
      'organization',
    ];
    this.columnPreset = [
      {
        key: 'patientId',
        label: 'screen.patientsearch.table.patientId',
        renderer: createCellRenderer('button', this.getData, {
          key: 'id',
          handler: this.handleGoToPatientScreen,
        }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
      {
        key: 'organization',
        label: 'screen.patientsearch.table.organization',
        renderer: createCellRenderer('text', this.getData, { key: 'organization' }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
      {
        key: 'lastName',
        label: 'screen.patientsearch.table.lastName',
        renderer: createCellRenderer('text', this.getData, { key: 'lastName' }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
      {
        key: 'firstName',
        label: 'screen.patientsearch.table.firstName',
        renderer: createCellRenderer('text', this.getData, { key: 'firstName' }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
      {
        key: 'dob',
        label: 'screen.patientsearch.table.dob',
        renderer: createCellRenderer('text', this.getData, { key: 'birthDate' }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
      {
        key: 'familyComposition',
        label: 'screen.patientsearch.table.familyComposition',
        renderer: createCellRenderer('text', this.getData, { key: 'familyComposition' }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
      {
        key: 'position',
        label: 'screen.patientsearch.table.position',
        renderer: createCellRenderer('text', this.getData, { key: 'proband' }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
      {
        key: 'practitioner',
        label: 'screen.patientsearch.table.practitioner',
        renderer: createCellRenderer('text', this.getData, { key: 'practitioner' }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
      {
        key: 'request',
        label: 'screen.patientsearch.table.request',
        renderer: createCellRenderer('text', this.getData, { key: 'request' }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
      {
        key: 'status',
        label: 'screen.patientsearch.table.status',
        renderer: createCellRenderer('dot', this.getData, {
          key: 'status',
          renderer: (value) => {
            if (value === 'completed') {
              return '#52c41a';
            } return '#ffa812';
          },
        }),
        columnWidth: COLUMN_WIDTHS.DEFAULT,
      },
    ];
    this.state.facetFilterOpen = Array(this.columnPreset.length).fill(false);
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
          familyComposition: result.family.composition || '',
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

  getData() {
    const { data } = this.state;
    return data;
  }

  getValue(type) {
    const { data } = this.state;
    let value = [];
    if (type === 'practitioner') {
      data.map(d => (
        !value.includes(d.practitioner) ? value.push(d.practitioner) : null
      ));
    } else if (type === 'status') {
      data.map(d => (
        !value.includes(d.status) ? value.push(d.status) : null
      ));
    } else if (type === 'familyComposition') {
      value = ['solo', 'duo', 'trio'];
    } else if (type === 'position') {
      value = ['Proband', 'Parent'];
    } else if (type === 'organization') {
      data.map(d => (
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

  handlePageChange(page) {
    const { actions, search } = this.props;
    const { size } = this.state;
    this.setState({
      page,
    });

    if (search.lastSearchType === 'autocomplete') {
      actions.autoCompletePatients('partial', search.autocomplete.query, page, size);
    } else {
      actions.searchPatientsByQuery(search.patient.query, page, size);
    }
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
      actions.searchPatientsByQuery(null, 1, size);
      actions.autoCompletePatients('partial', null, 1, size);
    }
  }

  handleAutoCompleteSelect(value) {
    const { actions } = this.props;
    const patientId = value.split(' ')[0] || null;
    if (patientId) {
      actions.navigateToPatientScreen(patientId);
    }
  }

  handleGoToPatientScreen(e) {
    const { actions } = this.props;
    const value = e.target.getAttribute('data-id');
    actions.navigateToPatientScreen(value);
  }

  handleGotoSoumissionPage(e) {
    console.log('coucou');
    const { actions } = this.props;
    const value = e.target.getAttribute('data-id');
    actions.navigateToSoumissionScreen(value);
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
    const { app, search } = this.props;
    const { patient } = search;
    const { total } = patient;
    const { showSubloadingAnimation } = app;
    const {
      size, page, isFacetOpen, facet,
    } = this.state;

    const { Title } = Typography;
    const { SubMenu } = Menu;
    const placeholderText = intl.get('screen.patientsearch.placeholder');
    const selectAll = intl.get('screen.patientvariant.filter.selection.all');
    const selectNone = intl.get('screen.patientvariant.filter.selection.none');

    const rowHeight = Array(size).fill(36);
    const autoCompleteResults = search.autocomplete.results.map(result => ({
      value: result.id,
      text: (
        <>
          <Typography.Text strong>{result.firstName} {result.lastName}</Typography.Text>
          <br />
          <Typography.Text
            disabled
            style={{
              fontSize: 10, color: '#ABB3BC', marginTop: -5, display: 'block',
            }}
          >{result.ramq}
          </Typography.Text>
          <hr style={{
            borderTop: 'none', borderBottom: '1px solid #CCCCCC', marginBottom: -5, marginTop: 3,
          }}
          />
        </>
      ),
    }));

    return (
      <Content>
        <Header />
        <Card className="patientSearch">
          <Row>
            <Col span={24}>
              <Title level={3}>{ intl.get('screen.patientsearch.title') }</Title>
            </Col>
          </Row>
          <Row type="flex" justify="space-between" className="searchNav">
            <Col>
              <Button className={isFacetOpen ? 'facet openFacet' : 'facet'} onClick={this.handleOpenFacet}>
                <div>
                  <IconKit className="btnIcon" size={16} icon={ic_tune} />
                  Filtrer
                </div>
                { isFacetOpen && (
                <IconKit className="btnClose" size={16} icon={ic_close} />
                )}
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
                dataSource={autoCompleteResults}
                onChange={this.handleAutoCompleteChange}
                onSelect={this.handleAutoCompleteSelect}
                onBlur={this.handleAutoCompleteClose}
              >
                <Input prefix={<Icon type="search" />} onPressEnter={this.handleAutoCompletePressEnter} />
              </AutoComplete>
            </Col>
            <Col>
              <Button className={`${style.btnPrimary} ${style.btn}`} onClick={this.handleGotoSoumissionPage}>
                <IconKit size={16} icon={ic_add} />
                { intl.get('screen.patientsearch.button.new') }
              </Button>
            </Col>
          </Row>
          <Row type="flex" justify="space-between">
            { isFacetOpen && (
            <Col className={isFacetOpen ? 'openFacet' : 'closeFacet'}>
              <Menu
                onClick={this.handleClick}
                mode="inline"
                className="menuCaterogy"
                onOpenChange={this.handleCategoriesOpenChange}
              >{
                facet.map(type => (
                  <SubMenu
                    className="category"
                    key={type}
                    title={(
                      <span className="subMenuTitle">
                        <IconKit size={24} icon={this.isCategorieFacetOpen(type) ? ic_keyboard_arrow_down : ic_keyboard_arrow_right} className="iconRightArrowDropDown" />
                        <div className="titleName">
                          <span className="value">{intl.get(`screen.patientsearch.table.${type}`)}</span>
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
                        <Button onClick={this.handleSelectAll}>{selectAll}</Button>
                        <Divider type="vertical" />
                        <Button onClick={this.handleSelectNone}>{selectNone}</Button>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Checkbox.Group className="checkboxGroup" onChange={this.handleSelectionChange}>
                            { this.getValue(type).map(option => (
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
            )}
            <Col className={isFacetOpen ? 'table table-facet' : 'table'}>
              <Card bordered={false} className="tablePatient">
                <InteractiveTable
                  key="patient-interactive-table"
                  size={size}
                  page={page}
                  total={total}
                  schema={this.columnPreset}
                  columnWidth={this.columnPreset.map(c => c.columnWidth)}
                  pageChangeCallback={this.handlePageChange}
                  pageSizeChangeCallback={this.handlePageSizeChange}
                  exportCallback={this.exportToTsv}
                  numFrozenColumns={1}
                  isLoading={showSubloadingAnimation}
                  rowHeight={rowHeight}
                />
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
  app: PropTypes.shape(appShape).isRequired,
  search: PropTypes.shape(searchShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    navigateToPatientScreen,
    navigateToSoumissionScreen,
    autoCompletePatients,
    searchPatientsByQuery,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  search: state.search,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientSearchScreen);
