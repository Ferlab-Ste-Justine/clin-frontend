/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Descriptions, Typography, PageHeader, Tabs, Row, Col, Dropdown, Button, Popover, Checkbox, Icon
} from 'antd';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import TableResults, { createCellRenderer } from '../../Table/index';
import TablePagination from '../../Table/Pagination'
import VariantNavigation from './components/VariantNavigation';

import './style.scss';
import { patientShape } from '../../../reducers/patient';
import { variantShape } from '../../../reducers/variant';

import Statement from '../../Query/Statement';
import { fetchSchema, selectQuery, replaceQuery, replaceQueries, removeQuery, duplicateQuery, sortStatement, searchVariants, commitHistory, undo } from '../../../actions/variant';

const VARIANT_TAB = 'VARIANTS'
const GENE_TAB = 'GENES'


class PatientVariantScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      size: 10,
      columns: [],
      visibleColumns: {
        [VARIANT_TAB]: [],
        [GENE_TAB]: []
      },
      currentTab: null,
      variantColumns: [],
      variantData: [],
      geneColumns: [],
      geneData: [],
    };

    this.handleQuerySelection = this.handleQuerySelection.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQueriesChange = this.handleQueriesChange.bind(this);
    this.handleQueriesRemoval = this.handleQueriesRemoval.bind(this);
    this.handleQueryDuplication = this.handleQueryDuplication.bind(this);
    this.handleStatementSort = this.handleStatementSort.bind(this);
    this.handleCommitHistory = this.handleCommitHistory.bind(this);
    this.handleDraftHistoryUndo = this.handleDraftHistoryUndo.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleColumnsVisible = this.handleColumnsVisible.bind(this);
    this.getVariantData = this.getVariantData.bind(this);
    this.getGeneData = this.getGeneData.bind(this);

    // @NOTE Initialize Component State
    const { actions, variant, patient } = props;
    const { schema } = variant;

    this.state.currentTab = VARIANT_TAB
    this.state.variantColumns = [
      { key: 'variant', label: 'Variant ID', component: createCellRenderer('variant', 'text', this.state.variantData) },
      { key: 'type', label: 'Variant Type', component: createCellRenderer('type', 'text', this.state.variantData) },
    ];
    this.state.visibleColumns[VARIANT_TAB] = this.state.variantColumns.map(column => column.key)

    //@TODO
    this.state.geneColumns = [];
    this.state.visibleColumns[GENE_TAB] = [];

    // @NOTE Make sure we have a schema defined in redux
    if (!schema.version) {
      actions.fetchSchema();
    }
    props.actions.searchVariants(patient.details.id, [{key:'aggs', instructions:[]}], 'aggs', 'impact', 0, 1);
    this.handleTabChange(VARIANT_TAB)
  }

  /*
    static getDerivedStateFromProps(nextProps) {
      const { results } = nextProps;
      if (!results) {
          return null;
      }

      return mapResults(results)
  }

   */


  handleQuerySelection(key) {
    const { actions, variant, patient } = this.props;

    if (!key) {
      actions.searchVariants(patient.details.id, [{key:'aggs', instructions:[]}], 'aggs', 'impact', 0, 1);
    } else {
      const { draftQueries } = variant;
      actions.selectQuery(key);
      actions.searchVariants(patient.details.id, draftQueries, key, 'impact', 0, 25);
    }
  }

  handleQueryChange(query) {
    const { actions } = this.props;
    actions.replaceQuery(query.data || query);
    this.handleCommitHistory();

    setTimeout(() => {
      this.handleQuerySelection(query.key || query.data.key);
    }, 100)
  }

  handleQueriesChange(queries, activeQuery) {
    const { actions } = this.props;
    this.handleCommitHistory();
    actions.replaceQueries(queries);
    setTimeout(() => {
      if (activeQuery) {
        this.handleQuerySelection((activeQuery.key || activeQuery.data.key));
      } else if (queries.length === 1) {
        this.handleQuerySelection(queries[0].key);
      }
    }, 100)
  }

  handleQueriesRemoval(keys) {
    const { actions } = this.props;
    this.handleCommitHistory();
    actions.removeQuery(keys);
  }

  handleQueryDuplication(query, index) {
    const { actions } = this.props;
    this.handleCommitHistory();
    actions.duplicateQuery(query.data, index);

    setTimeout(() => {
      this.handleQuerySelection(query.key);
    }, 100)
  }

  handleStatementSort(sortedQueries) {
    const { actions } = this.props;
    this.handleCommitHistory();
    actions.sortStatement(sortedQueries)
  }

  handleCommitHistory() {
    const { actions, variant } = this.props;
    const { draftQueries } = variant;
    actions.commitHistory(draftQueries);
  }

  handleDraftHistoryUndo() {
    const { actions } = this.props;
    actions.undo();
  }

  handleTabChange(key) {
    this.setState({
      columns: [],
      currentTab: key,
    });
  }

  handleColumnsVisible(checkedValues) {
    const { visibleColumns, currentTab } = this.state;
    visibleColumns[currentTab] = checkedValues
    this.setState({
      columns: [],
      visibleColumns,
    });
  }

  getVariantData() {
    return this.state.variantData
  }

  getGeneData() {
    return this.state.getGeneData
  }

  render() {
    const { intl, variant, patient } = this.props;
    const { draftQueries, draftHistory, originalQueries, facets, results, matches, schema, activeQuery } = variant;
    const searchData = [];

    if (schema.categories) {
        schema.categories.forEach((category) => {
            searchData.push({
                id: category.id,
                type: 'category',
                label: intl.formatMessage({ id: `screen.patientvariant.${category.label}` }),
                data: category.filters ? category.filters.reduce((accumulator, filter) => {
                  const searcheableFacet = filter.facet ? filter.facet.map((facet) => {
                    return {
                      id: facet.id,
                      value: intl.formatMessage({ id: `screen.patientvariant.${(!facet.label ? filter.label : facet.label)}` }),
                    }
                  }) : []

                  return accumulator.concat(searcheableFacet)
                }, []) : []
            })
        })
    }
    if (facets[activeQuery]) {
      Object.keys(facets[activeQuery])
        .forEach((key) => {
          searchData.push({
            id: key,
            type: 'filter',
            label: intl.formatMessage({ id: `screen.patientvariant.filter_${key}` }),
            data: facets[activeQuery][key].map((value) => {
              return {
                id: value.value,
                value: value.value,
                count: value.count,
              }
            })
          })
        })
    }

    const {
      columns, variantColumns, geneColumns, size, page, visibleColumns, currentTab, variantData, geneData
    } = this.state;

    const columnData = currentTab === VARIANT_TAB ? variantColumns : geneColumns;
    const total = currentTab === VARIANT_TAB ? variantData.length : geneData.length;

    //if (total === 0) {
    //  return null
    //}

    const columnVisibilitySelector = (
      <Dropdown key="visibility-selector" overlay={(
        <Popover>
          <Card>
            <Row>
              <Checkbox.Group className="checkbox" style={{ width: '100%' }} defaultValue={visibleColumns[currentTab]} onChange={this.handleColumnsVisible}>
                {columnData.map((column , index) => (
                  <Row key={index}>
                    <Col>
                      <Checkbox value={column.key}>{column.label}</Checkbox>
                    </Col>
                  </Row>
                ))}
              </Checkbox.Group>
            </Row>
          </Card>
        </Popover>
      )} trigger={['hover']}>
        <Button type="primary">
          Columns
          <Icon type="caret-down" />
        </Button>
      </Dropdown>
    );

    return (
      <Content>
        <Header />
        <Navigation />
        <Card>
          <PageHeader
              title={(
                  <div>
                    <Typography.Title level={2}>
                      Recherche de variants
                    </Typography.Title>
                  </div>
              )}
          />
            <Descriptions title="Patient [PT93993], Masculin, Proband, Affecté" layout="horizontal" column={1}>
                <Descriptions.Item label="Famille">[FA09383], Mère: [PT3983883] (Non affecté), Père: [PT4736] (Non affecté)</Descriptions.Item>
                <Descriptions.Item label="Signes">Epilepsie ([HP93993]), Schizophrénie ([HP2772])</Descriptions.Item>
                <Descriptions.Item label="Indication(s)">Anomalies neuro-psychiatriques</Descriptions.Item>
            </Descriptions>
            <VariantNavigation
                key="variant-navigation"
                className="variant-navigation"
                intl={intl}
                schema={schema}
                patient={patient}
                queries={draftQueries}
                activeQuery={activeQuery}
                data={facets[activeQuery] || {}}
                onEditCallback={this.handleQueryChange}
                searchData={searchData}
            />
            <br />
            <br />
            <Statement
              key="variant-statement"
              activeQuery={activeQuery}
              data={draftQueries}
              draftHistory={draftHistory}
              original={originalQueries}
              intl={intl}
              matches={matches}
              facets={facets}
              target={patient}
              categories={schema.categories}
              options={{
                  copyable: true,
                  duplicatable: true,
                  editable: true,
                  removable: true,
                  reorderable: true,
                  selectable: true,
                  undoable: true,
              }}
              display={{
                  compoundOperators: true,
              }}
              onSelectCallback={this.handleQuerySelection}
              onSortCallback={this.handleStatementSort}
              onEditCallback={this.handleQueryChange}
              onBatchEditCallback={this.handleQueriesChange}
              onRemoveCallback={this.handleQueriesRemoval}
              onDuplicateCallback={this.handleQueryDuplication}
              onDraftHistoryUndoCallback={this.handleDraftHistoryUndo}
              searchData={searchData}
              externalData={patient}
            />
            <br/>
            <br/>
          <Tabs key="patient-variants-tabs" type="card" onChange={this.handleTabChange}>
            <Tabs.TabPane tab="Variants" key={VARIANT_TAB}>
              <Row>
                <Col align="end">
                  {columnVisibilitySelector}
                </Col>
              </Row>
              <br />
              <Row>
                <Col>
                  <TableResults
                    key="variant-results-table"
                    size={size}
                    total={total}
                    columns={variantColumns.map(column => column.component)}




                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col align="end">
                  <TablePagination
                    key="variant-results-pagination"
                    total={total}
                    size={size}
                    page={page}
                    handlePageChange={(current, next) => { console.log('TablePagination Variants handlePageChange ', current, next) }}
                    handleSizeChange={(current, next) => { console.log('TablePagination Variants handleSizeChange ', current, next) }}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Genes" key={GENE_TAB} disabled>
              <Row>
                <Col align="end">
                  {columnVisibilitySelector}
                </Col>
              </Row>
              <br />
              <Row>
                <Col>
                  <TableResults
                    key="gene-results-table"
                    columns={[]}
                    size={size}
                    total={total}
                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col align="end">
                  <TablePagination
                    key="gene-results-pagination"
                    total={total}
                    size={size}
                    page={page}
                    handlePageChange={(current, next) => { console.log('TablePagination Genes handlePageChange ', current, next) }}
                    handleSizeChange={(current, next) => { console.log('TablePagination Genes handleSizeChange ', current, next) }}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>
          </Tabs>
        </Card>
        <Footer />
      </Content>
    );
  }
}

PatientVariantScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
  variant: PropTypes.shape(variantShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    fetchSchema,
    selectQuery,
    replaceQuery,
    replaceQueries,
    removeQuery,
    duplicateQuery,
    sortStatement,
    searchVariants,
    commitHistory,
    undo,
  }, dispatch),
});

const mapStateToProps = state => ({
  intl: state.intl,
  patient: state.patient,
  variant: state.variant,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(PatientVariantScreen));
