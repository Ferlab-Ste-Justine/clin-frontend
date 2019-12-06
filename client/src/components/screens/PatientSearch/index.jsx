/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, AutoComplete, Row, Col, Input, Icon, Typography, Button,
} from 'antd';
import { ExportToCsv } from 'export-to-csv';
import { format } from 'util';
import IconKit from 'react-icons-kit';
import {
  ic_tune, ic_add, ic_swap_horiz, ic_view_column, ic_cloud_download, ic_search, ic_replay, ic_keyboard_arrow_right, ic_keyboard_arrow_down, ic_close
} from 'react-icons-kit/md';
import {
  cloneDeep, filter, pullAllBy, isEqual, find, findIndex, debounce,
} from 'lodash';

import './style.scss';
import style from '../../../containers/App/style.module.scss';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import { createCellRenderer } from '../../Table/index';
import InteractiveTable from '../../Table/InteractiveTable'
import { searchShape } from '../../../reducers/search';
import { navigateToPatientScreen } from '../../../actions/router';
import { autoCompletePatients, searchPatientsByQuery } from '../../../actions/patient';
import { appShape } from '../../../reducers/app';


class PatientSearchScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      autoCompleteIsOpen: false,
      size: 25,
      page: 1,
      isFacetOpen: false,
      facetFilterOpen: [],
      facet:[],
      data: [],
    };
    this.handleAutoCompleteChange = debounce(this.handleAutoCompleteChange.bind(this), 250, { leading: true });
    this.handleAutoCompleteSelect = this.handleAutoCompleteSelect.bind(this);
    this.handleAutoCompletePressEnter = this.handleAutoCompletePressEnter.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.exportToTsv = this.exportToTsv.bind(this);
    this.handleOpenFacet = this.handleOpenFacet.bind(this);
    this.getCardCategoryTitle = this.getCardCategoryTitle.bind(this);
    this.isCategorieFacetOpen = this.isCategorieFacetOpen.bind(this);
    this.changeFacetFilterOpen = this.changeFacetFilterOpen.bind(this);
    this.getData = this.getData.bind(this)
    this.handleGoToPatientScreen = this.handleGoToPatientScreen.bind(this)

    // @NOTE Initialize Component State
    const { intl } = props;

    this.state.facet = [
        intl.formatMessage({ id: 'screen.patientsearch.table.practitioner' }),
        intl.formatMessage({ id: 'screen.patientsearch.table.status' }),
        "Category 1",
        "Category 2",
    ]
    this.columnPreset = [
      { key: 'patientId', label:intl.formatMessage({ id: 'screen.patientsearch.table.patientId' }), renderer: createCellRenderer('button', this.getData, { key: 'id' , handler: this.handleGoToPatientScreen})},
      { key: 'organization', label:intl.formatMessage({ id: 'screen.patientsearch.table.organization' }), renderer: createCellRenderer('text', this.getData, { key: 'organization' })},
      { key: 'firstName', label:intl.formatMessage({ id: 'screen.patientsearch.table.firstName' }), renderer: createCellRenderer('text', this.getData, { key: 'firstName' })},
      { key: 'lastName', label:intl.formatMessage({ id: 'screen.patientsearch.table.lastName' }), renderer: createCellRenderer('text', this.getData, { key: 'lastName' })},
      { key: 'dob', label:intl.formatMessage({ id: 'screen.patientsearch.table.dob' }), renderer: createCellRenderer('text', this.getData, { key: 'birthDate' })},
      { key: 'familyComposition', label:intl.formatMessage({ id: 'screen.patientsearch.table.familyComposition' }),renderer: createCellRenderer('text', this.getData, { key: 'familyComposition' })},
      { key: 'position', label:intl.formatMessage({ id: 'screen.patientsearch.table.position' }),renderer: createCellRenderer('text', this.getData, { key: 'proband' })},
      { key: 'practitioner', label:intl.formatMessage({ id: 'screen.patientsearch.table.practitioner' }),renderer: createCellRenderer('text', this.getData, { key: 'practitioner' })},
      { key: 'request', label:intl.formatMessage({ id: 'screen.patientsearch.table.request' }),renderer: createCellRenderer('text', this.getData, { key: 'request' })},
      { key: 'status', label:intl.formatMessage({ id: 'screen.patientsearch.table.status' }), renderer: createCellRenderer('dot', this.getData, { key: 'status',renderer: (value)=>{ if(value === 'completed'){return 'success'} else {return 'default'} }})}
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
    return data
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

  handleGoToPatientScreen(e){
    const { actions } = this.props;
    const value =  e.target.getAttribute('data-id')
    actions.navigateToPatientScreen(value);
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

  getCardCategoryTitle(name, index) {
    const open = this.isCategorieFacetOpen(index);
    return (
      <a onClick={this.changeFacetFilterOpen.bind(null, index)} key={index}>
        {name}
        {!open ? <IconKit size={24} icon={ic_keyboard_arrow_right} /> : <IconKit size={24} icon={ic_keyboard_arrow_down} />}
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
    const { app, intl, search } = this.props;
    const { patient } = search;
    const { total } = patient;
    const { showSubloadingAnimation } = app;
    const { size, page, isFacetOpen, facet,
    } = this.state;

    const { Title } = Typography;
    const placeholderText = intl.formatMessage({ id: 'screen.patientsearch.placeholder' });

    const autoCompleteResults = search.autocomplete.results.map(result => {
      return {
        value: result.id,
        text: (<>
          <Typography.Text strong>{result.firstName} {result.lastName}</Typography.Text>
          <br />
          <Typography.Text disabled style={{ fontSize: 10, color: '#ABB3BC', marginTop: -5, display: 'block' }}>{result.ramq}</Typography.Text>
          <hr style={{ borderTop: 'none', borderBottom: '1px solid #CCCCCC', marginBottom: -5, marginTop: 3 }}/>
        </>)
      };
    })

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
              <Button disabled className={`${style.btn} filter`} style={isFacetOpen ? { width: 280 } : { width: 'auto' }} onClick={this.handleOpenFacet}>
                <div>
                  <IconKit size={16} icon={ic_tune} />
                  Filtrer
                </div>
                { isFacetOpen && (
                     <IconKit size={16} icon={ic_close} />
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
                <Card key={index} bordered={false} className="category" title={this.getCardCategoryTitle(column, index)}>
                </Card>
              ))
                 }

            </Col>
            )}
            <Col className={isFacetOpen ? 'table table-facet' : 'table'}>
                <Card bordered={false} className="tablePatient">
                  <InteractiveTable
                    key="patient-interactive-table"
                    intl={intl}
                    size={size}
                    page={page}
                    total={total}
                    schema={this.columnPreset}
                    pageChangeCallback={this.handlePageChange}
                    pageSizeChangeCallback={this.handlePageSizeChange}
                    exportCallback={this.exportToTsv}
                    numFrozenColumns={1}
                    isLoading={showSubloadingAnimation}
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
  app: state.app,
  intl: state.intl,
  search: state.search,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(PatientSearchScreen));
