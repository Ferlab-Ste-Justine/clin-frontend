/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Descriptions, Typography, PageHeader,
} from 'antd';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import VariantNavigation from './components/VariantNavigation';
import VariantResultsTable from './components/VariantResultsTable';

import './style.scss';
import { patientShape } from '../../../reducers/patient';
import { variantShape } from '../../../reducers/variant';

import Statement from '../../Query/Statement';
import { fetchSchema, selectQuery, replaceQuery, replaceQueries, removeQuery, duplicateQuery, sortStatement, searchVariants, commitHistory, undo } from '../../../actions/variant';


class PatientVariantScreen extends React.Component {
  constructor(props) {
    super(props);
    this.handleQuerySelection = this.handleQuerySelection.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQueriesChange = this.handleQueriesChange.bind(this);
    this.handleQueriesRemoval = this.handleQueriesRemoval.bind(this);
    this.handleQueryDuplication = this.handleQueryDuplication.bind(this);
    this.handleStatementSort = this.handleStatementSort.bind(this);
    this.handleCommitHistory = this.handleCommitHistory.bind(this);
    this.handleDraftHistoryUndo = this.handleDraftHistoryUndo.bind(this);

    // @NOTE Initialize Component State
    const { actions, variant, patient } = props;
    const { schema } = variant;
    // @NOTE Make sure we have a schema defined in redux
    if (!schema.version) {
      actions.fetchSchema();
    }

    props.actions.searchVariants(patient.details.id, [{key:'aggs', instructions:[]}], 'aggs', 'impact', 0, 1);
  }

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
            <br />
            <VariantResultsTable
                key="variant-results"
                intl={intl}
                results={results[activeQuery] || []}
            />
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
