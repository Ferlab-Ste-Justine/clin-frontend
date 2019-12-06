/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Descriptions, Typography, PageHeader, Tabs, Button,
} from 'antd';
import { cloneDeep, find, flatten } from 'lodash';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import { createCellRenderer } from '../../Table/index';
import InteractiveTable from '../../Table/InteractiveTable'
import VariantNavigation from './components/VariantNavigation';
import Autocompleter, { tokenizeObjectByKeys } from '../../../helpers/autocompleter';
import { appShape } from '../../../reducers/app';
import { patientShape } from '../../../reducers/patient';
import { variantShape } from '../../../reducers/variant';

import Statement from '../../Query/Statement';
import { fetchSchema, selectQuery, replaceQuery, replaceQueries, removeQuery, duplicateQuery, sortStatement, searchVariants, commitHistory, undo } from '../../../actions/variant';
import { navigateToPatientScreen } from '../../../actions/router';

import './style.scss';


const VARIANT_TAB = 'VARIANTS'
const GENE_TAB = 'GENES'

class PatientVariantScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: VARIANT_TAB,
      page: 1,
      size: 25,
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
    this.handleColumnVisibilityChange = this.handleColumnVisibilityChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleNavigationToPatientScreen = this.handleNavigationToPatientScreen.bind(this);
    this.getData = this.getData.bind(this);

    // @NOTE Initialize Component State
    this.state.columnPreset = {
      [VARIANT_TAB]: [
        { key: 'mutationId', label: 'Variant', renderer: createCellRenderer('text', this.getData, { key: 'mutationId' }) },
        { key: 'type', label: 'Variant Type', renderer: createCellRenderer('text', this.getData, { key: 'type' }) },
        { key: 'gene', label: 'Gene Symbol', renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.genes[0].geneSymbol } catch (e) { return ''; } }
          })},
        { key: 'aachanges', label: 'AA Change(s)', renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].aaChange } catch (e) { return ''; } }
          })},
        { key: 'consequences', label: 'Consequence(s)', renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].consequence } catch (e) { return ''; } }
          })},
        { key: 'clinvar', label: 'ClinVar', renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.clinvar.clinvar_clinsig } catch (e) { return ''; } }
          })},
        { key: 'dbsnp', label: 'DbSnp', renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.bdExt.dbSNP[0] } catch (e) { return ''; } }
          })},
        { key: 'pubmed', label: 'Pubmed', renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return JSON.stringify(data.bdExt.pubmed) } catch (e) { return ''; } }
          })},
        { key: 'sift', label: 'SIFT', renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].predictions.SIFT } catch (e) { return ''; } }
          })},
        { key: 'polyphenhvar', label: 'Polyphen2 HVAR', renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].predictions.Polyphen2_HVAR_pred } catch (e) { return ''; } }
          })},
        { key: 'phylop', label: 'PhyloP', renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].conservationsScores.PhyloP17Way } catch (e) { return ''; } }
          })},
      ],
      [GENE_TAB]: []
    };

    const { actions, variant } = props;
    const { schema } = variant;
    // @NOTE Make sure we have a schema defined in redux
    if (!schema.version) {
      actions.fetchSchema();
    }
  }

  componentDidMount() {
    const { variant } = this.props;
    const { activeQuery } = variant;
    this.handleQuerySelection(activeQuery);
  }

  handleNavigationToPatientScreen(e) {
    const { actions } = this.props;
    actions.navigateToPatientScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
  }

  handlePageChange(page) {
    const { variant } = this.props;
    const { activeQuery } = variant;

    this.setState({
      page,
    }, () => {
      this.handleQuerySelection(activeQuery)
    })
  }

  handlePageSizeChange(size) {
    const { variant } = this.props;
    const { activeQuery } = variant;

    this.setState({
      size,
    }, () => {
      this.handleQuerySelection(activeQuery)
    })
  }

  handleQuerySelection(key) {
    const { actions, variant, patient } = this.props;
    const { draftQueries } = variant;
    actions.selectQuery(key);
    actions.searchVariants(patient.details.id, draftQueries, key, 'impact', 0, this.state.size);
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
      this.handleQuerySelection(query.data.key);
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
      currentTab: key,
    });
  }

  handleColumnVisibilityChange(checkedValues) {
    const { visibleColumns, currentTab } = this.state;
    visibleColumns[currentTab] = checkedValues

    this.setState({
      visibleColumns,
    });
  }

  handleCopy(row, col) {
    const data = this.getData();

    return data[row]
  }

  getData() {
    const { currentTab } = this.state;
    if (currentTab === VARIANT_TAB) {
      const { activeQuery, results } = this.props.variant;

      return results[activeQuery]
    }

    return [];
  }

  render() {
    const { intl, app, variant, patient } = this.props;
    const { showSubloadingAnimation } = app;
    const { draftQueries, draftHistory, originalQueries, matches, facets, schema, activeQuery } = variant;
    const {
      size, page, currentTab,
    } = this.state;
    const total = currentTab === VARIANT_TAB ? matches[activeQuery] : [];
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
    const tokenizedSearchData = searchData.reduce((accumulator, group) => {
      if (group.data) {
        group.data.forEach(datum => {
          if (group.type === 'category') {
            accumulator.push({
              id: group.id,
              type: group.type,
              label: group.label,
              value: datum.value,
            })
          } else {
            accumulator.push({
              id: group.id,
              type: group.type,
              label: group.label,
              value: datum.value,
              count: datum.count,
            })
          }
        })
      }

      return accumulator;
    }, [])
    const searchDataTokenizer = tokenizeObjectByKeys();
    const autocomplete = Autocompleter(tokenizedSearchData, searchDataTokenizer)

    return (
      <Content>
        <Header />
        <Card>
          <PageHeader
              title={(
                  <div>
                    <Typography.Title level={2}>
                      Recherche de variants
                    </Typography.Title>
                  </div>
              )}
              extra={(
                <a href="#" data-patient-id={patient.details.id} onClick={this.handleNavigationToPatientScreen}>
                  <Button type="primary">
                    Patient Details
                  </Button>
                </a>
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
              autocomplete={autocomplete}
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
          <Tabs key="variant-interpreter-tabs" activeKey={currentTab} onChange={this.handleTabChange}>
            <Tabs.TabPane tab="Variants" key={VARIANT_TAB}>
              { currentTab === VARIANT_TAB && (<InteractiveTable
                key="variant-interactive-table"
                intl={intl}
                isLoading={showSubloadingAnimation}
                size={size}
                page={page}
                total={total}
                schema={this.state.columnPreset[VARIANT_TAB]}
                copyCallback={this.handleCopy}
                pageChangeCallback={this.handlePageChange}
                pageSizeChangeCallback={this.handlePageSizeChange}
                isExportable={false}
              />) }
            </Tabs.TabPane>
            <Tabs.TabPane tab="Genes" key={GENE_TAB} disabled>
              { currentTab === GENE_TAB && (<InteractiveTable
                key="gene-interactive-table"
                intl={intl}
                isLoading={showSubloadingAnimation}
                size={size}
                page={page}
                total={total}
                schema={this.state.columnPreset[GENE_TAB]}
                pageChangeCallback={this.handlePageChange}
                pageSizeChangeCallback={this.handlePageSizeChange}
                copyCallback={this.handleCopy}
                isExportable={false}
              />) }
            </Tabs.TabPane>
          </Tabs>
        <Footer />
        </Card>
      </Content>
    );
  }
}

PatientVariantScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  app: PropTypes.shape(appShape).isRequired,
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
    navigateToPatientScreen,
  }, dispatch),
});

const mapStateToProps = state => ({
  intl: state.intl,
  app: state.app,
  patient: state.patient,
  variant: state.variant,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(PatientVariantScreen));
