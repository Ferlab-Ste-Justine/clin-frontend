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
import Table from '../../Table/index'
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
      visibleVariant: false,
      visibleGene: false,
      currentTab: null,
      visibleColumns: {
        [VARIANT_TAB]: [],
        [GENE_TAB]: []
      },
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
    this.toggleMenu = this.toggleMenu.bind(this);
    this.handleColumnsVisible = this.handleColumnsVisible.bind(this);

    // @NOTE Initialize Component State
    const { actions, variant, patient } = props;
    const { schema } = variant;

    this.state.currentTab = VARIANT_TAB
    this.state.variantColumns = [
      { key: 'variant', type: 'default' },
      { key: 'type' },
      { key: 'dbsnp' },
      { key: 'consequence' },
      { key: 'clinvar' },
      { key: 'vep' },
      { key: 'sift' },
      { key: 'polyph' },
      { key: 'zygosity' },
      { key: 'pubmed', type: 'pubmed' },
    ];
    this.state.geneColumns = [
      { key: 'gene', type: 'default' },
      { key: 'type' },
      { key: 'localisation' },
      { key: 'variants' },
      { key: 'omin' },
      { key: 'orphanet' },
      { key: 'ensemble' },
    ];
    this.state.visibleColumns[VARIANT_TAB] = Array.from(Array(this.state.variantColumns.length).keys())
    this.state.visibleColumns[GENE_TAB] = Array.from(Array(this.state.geneColumns.length).keys())

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
      visibleVariant: false,
      visibleGene: false,
    });
  }

  toggleMenu() {
    const { visibleVariant, visibleGene, currentTab } = this.state;
    currentTab === VARIANT_TAB ? this.setState({ visibleVariant: !visibleVariant }) : this.setState({ visibleGene: !visibleGene });
  }

  handleColumnsVisible(checkedValues) {
    const { visibleColumns, currentTab } = this.state;
    visibleColumns[currentTab] = checkedValues
    this.setState({
      columns: [],
      visibleColumns,
    });
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
      columns, variantColumns, geneColumns, size, page, visibleVariant, visibleGene, visibleColumns, currentTab, variantData, geneData
    } = this.state;

    const columnData = currentTab === VARIANT_TAB ? variantColumns : geneColumns;
    const columnSelectorIsVisible = currentTab === VARIANT_TAB ? visibleVariant : visibleGene;
    const defaultVisibleColumns = visibleColumns[currentTab]
    const count = currentTab === VARIANT_TAB ? variantData.length : geneData.length;

    //if (count === 0) {
    //  return null
    //}

    const visibleColumnsSelector = (
      <Popover visible={columnSelectorIsVisible}>
        <Card>
          <Row>
            <Checkbox.Group className="checkbox" style={{ width: '100%' }} defaultValue={defaultVisibleColumns} onChange={this.handleColumnsVisible}>
              {columnData.map((column , index) => (
                <Row key={index}>
                  <Col>
                    <Checkbox  value={column.key}>{column.key}</Checkbox>
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
                  <Dropdown overlay={visibleColumnsSelector} trigger={['click']} visible={visibleVariant}>
                    <Button type="primary" onClick={this.toggleMenu}>
                      Column
                      <Icon type="caret-down" />
                    </Button>
                  </Dropdown>
                </Col>
              </Row>
              <br />
              <Row>
                <Col span={24}>
                  <Table
                    key="variants-table"
                    size={0}
                    total={0}
                    columns={[]}
                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col align="end" span={24}>
                  <TablePagination
                    key="variants-pagination"
                    total={0}
                    page={1}
                    size={25}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Genes" key={GENE_TAB}>
              <Row>
                <Col align="end">
                  <Dropdown overlay={visibleColumnsSelector} trigger={['click']} visible={visibleGene}>
                    <Button type="primary" onClick={this.toggleMenu}>
                      Column
                      <Icon type="caret-down" />
                    </Button>
                  </Dropdown>
                </Col>
              </Row>
              <br />
              <Row>
                <Col span={24}>
                  <Table
                    key="genes-table"
                    size={0}
                    total={0}
                    columns={[]}
                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col align="end" span={24}>
                  <TablePagination
                    key="genes-pagination"
                    total={0}
                    page={1}
                    size={25}
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
