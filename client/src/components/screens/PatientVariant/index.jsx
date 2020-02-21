
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Tabs, Button, Tag, Row, Col, Dropdown, Menu,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_assignment_ind, ic_location_city, ic_folder_shared, ic_assignment_turned_in, ic_launch, ic_arrow_drop_down,
} from 'react-icons-kit/md';
import {
  sortBy,
} from 'lodash';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import { createCellRenderer } from '../../Table/index';
import InteractiveTable from '../../Table/InteractiveTable';
import VariantNavigation from './components/VariantNavigation';
import Autocompleter, { tokenizeObjectByKeys } from '../../../helpers/autocompleter';
import { appShape } from '../../../reducers/app';
import { patientShape } from '../../../reducers/patient';
import { variantShape } from '../../../reducers/variant';
import Statement from '../../Query/Statement';
import {
  fetchSchema, selectQuery, replaceQuery, replaceQueries, removeQuery, duplicateQuery, sortStatement,
  searchVariants, commitHistory,
  getStatements, createDraftStatement, updateStatement, deleteStatement, undo, selectStatement, duplicateStatement,
  createStatement, countVariants,
} from '../../../actions/variant';
import {
  updateUserProfile,
} from '../../../actions/user';
import { navigateToPatientScreen } from '../../../actions/router';

import './style.scss';
import style from './style.module.scss';
import { userShape } from '../../../reducers/user';


const VARIANT_TAB = 'VARIANTS';
const GENE_TAB = 'GENES';

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
    this.handleGetStatements = this.handleGetStatements.bind(this);
    this.handleCreateDraftStatement = this.handleCreateDraftStatement.bind(this);
    this.handleUpdateStatement = this.handleUpdateStatement.bind(this);
    this.handleDeleteStatement = this.handleDeleteStatement.bind(this);
    this.handleSelectStatement = this.handleSelectStatement.bind(this);
    this.handleDuplicateStatement = this.handleDuplicateStatement.bind(this);
    this.handleSetDefaultStatement = this.handleSetDefaultStatement.bind(this);
    this.getData = this.getData.bind(this);

    // @NOTE Initialize Component State
    this.state.columnPreset = {
      [VARIANT_TAB]: [
        { key: 'mutationId', label: 'screen.variantsearch.table.variant', renderer: createCellRenderer('text', this.getData, { key: 'mutationId' }) },
        { key: 'type', label: 'screen.variantsearch.table.variantType', renderer: createCellRenderer('text', this.getData, { key: 'type' }) },
        {
          key: 'gene',
          label: 'screen.variantsearch.table.geneSymbol',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.genes[0].geneSymbol; } catch (e) { return ''; } },
          }),
        },
        {
          key: 'aachanges',
          label: 'screen.variantsearch.table.aaChanges',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].aaChange; } catch (e) { return ''; } },
          }),
        },
        {
          key: 'consequences',
          label: 'screen.variantsearch.table.consequences',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].consequence; } catch (e) { return ''; } },
          }),
        },
        {
          key: 'clinvar',
          label: 'screen.variantsearch.table.clinvar',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.clinvar.clinvar_clinsig; } catch (e) { return ''; } },
          }),
        },
        {
          key: 'dbsnp',
          label: 'screen.variantsearch.table.dbsnp',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.bdExt.dbSNP[0]; } catch (e) { return ''; } },
          }),
        },
        {
          key: 'pubmed',
          label: 'screen.variantsearch.table.pubmed',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return JSON.stringify(data.bdExt.pubmed); } catch (e) { return ''; } },
          }),
        },
        {
          key: 'sift',
          label: 'screen.variantsearch.table.sift',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].predictions.SIFT; } catch (e) { return ''; } },
          }),
        },
        {
          key: 'polyphenhvar',
          label: 'screen.variantsearch.table.polyphen2hvar',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].predictions.Polyphen2_HVAR_pred; } catch (e) { return ''; } },
          }),
        },
        {
          key: 'phylop',
          label: 'screen.variantsearch.table.phylop',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => { try { return data.consequences[0].conservationsScores.PhyloP17Way; } catch (e) { return ''; } },
          }),
        },
      ],
      [GENE_TAB]: [],
    };

    const { actions, variant } = props;
    const { schema } = variant;
    // @NOTE Make sure we have a schema defined in redux
    if (!schema.version) {
      actions.fetchSchema();
    }
  }

  componentDidMount() {
    this.handleGetStatements();
  }

  getData() {
    const { currentTab } = this.state;
    if (currentTab === VARIANT_TAB) {
      const { variant } = this.props;
      const { activeQuery, results } = variant;

      return results[activeQuery];
    }
    return [];
  }

  handlePageChange(page) {
    const { patient, variant, actions } = this.props;
    const {
      draftQueries, activeQuery,
    } = variant;
    const { size } = this.state;
    const { id } = patient.details;

    this.setState({
      page,
    }, () => {
      actions.searchVariants(
        id,
        draftQueries,
        activeQuery,
        page,
        size,
      );
    });
  }

  handlePageSizeChange(size) {
    const { patient, variant, actions } = this.props;
    const {
      draftQueries, activeQuery,
    } = variant;
    const { page } = this.state;
    const { id } = patient.details;

    this.setState({
      size,
    }, () => {
      actions.searchVariants(
        id,
        draftQueries,
        activeQuery,
        page,
        size,
      );
    });
  }

  handleQuerySelection(key) {
    const { actions } = this.props;
    this.setState({
      page: 1,
      size: 25,
    }, () => {
      actions.selectQuery(key);
    });
  }

  handleQueryChange(query) {
    const { actions } = this.props;
    this.handleCommitHistory();
    this.setState({
      page: 1,
      size: 25,
    }, () => {
      actions.replaceQuery(query.data || query);
    });
  }

  handleQueriesChange(queries) {
    const { actions } = this.props;
    this.handleCommitHistory();
    this.setState({
      page: 1,
      size: 25,
    }, () => {
      actions.replaceQueries(queries);
    });
  }

  handleQueriesRemoval(keys) {
    const { actions } = this.props;
    this.handleCommitHistory();
    this.setState({
      page: 1,
      size: 25,
    }, () => {
      actions.removeQuery(keys);
    });
  }

  handleQueryDuplication(query, index) {
    const { actions } = this.props;
    this.handleCommitHistory();
    actions.duplicateQuery(query.data, index);

    setTimeout(() => {
      this.handleQuerySelection(query.data.key);
    }, 100);
  }

  handleStatementSort(sortedQueries) {
    const { actions } = this.props;
    this.handleCommitHistory();
    actions.sortStatement(sortedQueries);
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
    visibleColumns[currentTab] = checkedValues;

    this.setState({
      visibleColumns,
    });
  }

  handleCopy(row) {
    const data = this.getData();
    return JSON.stringify(data[row]);
  }

  handleGetStatements() {
    const { actions } = this.props;
    actions.getStatements();
  }

  handleCreateDraftStatement(statement = {}) {
    const { actions } = this.props;
    actions.createDraftStatement(statement);
  }

  handleUpdateStatement(id, title, description, queries = null) {
    const { actions, variant } = this.props;
    const { statements } = variant;
    if (!queries) {
      queries = statements[id].queries; { /* eslint-disable-line */ }
    }
    if (id === 'draft') {
      actions.createStatement(id, title, description, queries);
    } else {
      actions.updateStatement(id, title, description, queries);
    }
  }

  handleDeleteStatement(id) {
    const { actions } = this.props;
    actions.deleteStatement(id);
  }

  handleDuplicateStatement(id) {
    const { actions } = this.props;
    actions.duplicateStatement(id);
  }

  handleSelectStatement(id) {
    const { actions } = this.props;
    actions.selectStatement(id);
  }

  handleSetDefaultStatement(id) {
    const { actions, user } = this.props;
    const { profile } = user;

    actions.updateUserProfile(profile.uid, id, profile.patientTableConfig, profile.variantTableConfig);
  }

  handleNavigationToPatientScreen(e) {
    const { actions } = this.props;
    actions.navigateToPatientScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
  }

  render() {
    const {
      app, variant, patient, user,
    } = this.props;
    const { showSubloadingAnimation } = app;
    const {
      draftQueries, draftHistory, originalQueries, facets, schema, activeQuery,
      activeStatementId, activeStatementTotals, statements,
    } = variant;
    const {
      size, page, currentTab, columnPreset,
    } = this.state;
    const defaultStatementId = user.profile.defaultStatement ? user.profile.defaultStatement : null;
    const familyText = intl.get('screen.patientvariant.header.family');
    const motherText = intl.get('screen.patientvariant.header.family.mother');
    const fatherText = intl.get('screen.patientvariant.header.family.father');
    const viewAllText = intl.get('screen.patientvariant.header.ontology.viewAll');
    const genderFemaleIcon = (<path id="gender_female_24px-a" d="M12,3 C15.3137085,3 18,5.6862915 18,9 C18,11.97 15.84,14.44 13,14.92 L13,17 L15,17 L15,19 L13,19 L13,21 L11,21 L11,19 L9,19 L9,17 L11,17 L11,14.92 C8.16,14.44 6,11.97 6,9 C6,5.6862915 8.6862915,3 12,3 M12,5 C9.790861,5 8,6.790861 8,9 C8,11.209139 9.790861,13 12,13 C14.209139,13 16,11.209139 16,9 C16,6.790861 14.209139,5 12,5 Z" />);
    const genderMaleIcon = (<path id="gender_mael_24px-a" d="M9,9 C10.29,9 11.5,9.41 12.47,10.11 L17.58,5 L13,5 L13,3 L21,3 L21,11 L19,11 L19,6.41 L13.89,11.5 C14.59,12.5 15,13.7 15,15 C15,18.3137085 12.3137085,21 9,21 C5.6862915,21 3,18.3137085 3,15 C3,11.6862915 5.6862915,9 9,9 M9,11 C6.790861,11 5,12.790861 5,15 C5,17.209139 6.790861,19 9,19 C11.209139,19 13,17.209139 13,15 C13,12.790861 11.209139,11 9,11 Z" />);
    const observedHpoText = intl.get('screen.patientvariant.header.ontology.observed');

    const total = currentTab === VARIANT_TAB ? activeStatementTotals[activeQuery] : [];
    const searchData = [];
    const reverseCategories = {};
    if (schema.categories) {
      schema.categories.forEach((category) => {
        searchData.push({
          id: category.id,
          subid: null,
          type: 'category',
          label: intl.get(`${category.label}`),
          data: category.filters ? category.filters.reduce((accumulator, filter) => {
            const searcheableFacet = filter.facet ? filter.facet.map((facet) => {
              reverseCategories[facet.id] = category.id;
              return {
                id: facet.id,
                value: intl.get(`screen.patientvariant.${(!facet.label ? filter.label : facet.label)}`),
              };
            }) : [];

            return accumulator.concat(searcheableFacet);
          }, []) : [],
        });
      });
    }

    if (facets[activeQuery]) {
      Object.keys(facets[activeQuery])
        .forEach((key) => {
          searchData.push({
            id: reverseCategories[key],
            subid: key,
            type: 'filter',
            label: intl.get(`screen.patientvariant.filter_${key}`),
            data: facets[activeQuery][key].map(value => ({
              id: value.value,
              value: value.value,
              count: value.count,
            })),
          });
        });
    }

    const tokenizedSearchData = searchData.reduce((accumulator, group) => {
      if (group.data) {
        group.data.forEach((datum) => {
          accumulator.push({
            id: group.id,
            subid: group.subid || datum.id,
            type: group.type,
            label: group.label,
            value: datum.value,
            count: datum.count || null,
          });
        });
      }

      return accumulator;
    }, []);

    const searchDataTokenizer = tokenizeObjectByKeys();
    const autocomplete = Autocompleter(tokenizedSearchData, searchDataTokenizer);
    const completName = `${patient.details.lastName}, ${patient.details.firstName}`;
    const allOntology = sortBy(patient.ontology, 'term');
    const visibleOntology = allOntology.filter((ontology => ontology.observed === 'POS')).slice(0, 4);
    const familyMenu = (
      <Menu>
        <Menu.ItemGroup title={familyText} className={style.menuGroup}>
          {patient.family.members.mother !== ''
            ? (
              <Menu.Item>
                <a href="#" data-patient-id={patient.family.members.mother} onClick={this.handleNavigationToPatientScreen}> { /* eslint-disable-line */ }
                  {motherText}{' '}[{patient.family.members.mother}]
                </a>
              </Menu.Item>
            )
            : null}
          {patient.family.members.father !== ''
            ? (
              <Menu.Item>
                <a href="#" data-patient-id={patient.family.members.father} onClick={this.handleNavigationToPatientScreen}> { /* eslint-disable-line */ }
                  {fatherText}{' '}[{patient.family.members.father}]
                </a>
              </Menu.Item>
            )
            : null}
        </Menu.ItemGroup>
      </Menu>
    );

    const ontologyMenu = (
      <Menu>
        {
          allOntology.map(ontology => (
            <Menu.Item>
              <a className={style.ontologyItem}> { /* eslint-disable-line */ }
                {ontology.term}
                <IconKit className={`${style.iconLink} ${style.iconHover}`} size={14} icon={ic_launch} />
              </a>
            </Menu.Item>
          ))
        }
      </Menu>
    );

    return (
      <Content>
        <Header />
        <Card className="entity">
          { patient.details.id && (
          <div className={style.patientInfo}>
            <Row className={style.descriptionTitle} type="flex" align="middle">
              <a href="#" data-patient-id={patient.details.id} onClick={this.handleNavigationToPatientScreen}> { /* eslint-disable-line */ }
                <Button>
                  {completName}
                </Button>
              </a>
              <svg
                className={style.genderIcon}
              >
                {patient.details.gender === 'male' ? genderMaleIcon : genderFemaleIcon}{' '}
              /> { /* eslint-disable-line */ }
              </svg>
              <Tag className={`${style.tag} ${style.tagProban}`}>{patient.details.proband}</Tag>
              { patient.family.members.mother !== '' || patient.family.members.father !== ''
                ? (
                  <Dropdown overlay={familyMenu} overlayClassName={style.familyDropdown}>
                    <Tag className={style.tag}>
                      {familyText}
                      {' '}
                      <IconKit size={16} icon={ic_arrow_drop_down} />
                    </Tag>
                  </Dropdown>
                ) : null
              }
            </Row>
            <Row type="flex" className={style.descriptionPatient}>
              <Col>
                <IconKit className={style.icon} size={16} icon={ic_assignment_ind} />
                {' '}
                {patient.details.mrn}
              </Col>
              <Col>
                <IconKit className={style.icon} size={16} icon={ic_location_city} />
                {' '}
                {patient.organization.name}
              </Col>
              <Col>
                <IconKit className={style.icon} size={16} icon={ic_folder_shared} />
                {' '}
                {patient.details.ramq}
              </Col>
            </Row>
            { patient.ontology && patient.ontology.length > 0 && (
            <Row type="flex" align="middle" className={style.descriptionOntoloy}>
              <IconKit className={style.icon} size={16} icon={ic_assignment_turned_in} />
              {observedHpoText}:
              {visibleOntology.map(vontology => (
                <a href={`https://hpo.jax.org/app/browse/term/${vontology.code}`} target="_blank"> { /* eslint-disable-line */ }
                  {vontology.term}
                  <IconKit className={style.iconLink} size={14} icon={ic_launch} />
                </a>
              ))
                }

              { allOntology.length > 4
                ? (
                  <Dropdown overlay={ontologyMenu} className={style.ontologyTag} overlayClassName={style.ontologyDropdown}>
                    <Tag className={style.tag}>
                      {viewAllText}
                      <IconKit size={16} icon={ic_arrow_drop_down} />
                    </Tag>
                  </Dropdown>
                ) : null
              }
            </Row>
            ) }
          </div>
          ) }
          <VariantNavigation
            key="variant-navigation"
            className="variant-navigation"
            schema={schema}
            patient={patient}
            queries={draftQueries}
            activeQuery={activeQuery}
            data={facets[activeQuery] || {}}
            onEditCallback={this.handleQueryChange}
            searchData={searchData}
            autocomplete={autocomplete}
          />
          <Card className={`Content ${style.variantContent}`}>
            <Statement
              key="variant-statement"
              activeQuery={activeQuery}
              activeStatementId={activeStatementId}
              activeStatementTotals={activeStatementTotals}
              defaultStatementId={defaultStatementId}
              statements={statements}
              data={draftQueries}
              draftHistory={draftHistory}
              original={originalQueries}
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
              onSelectCallback={this.handleQuerySelection}
              onSortCallback={this.handleStatementSort}
              onEditCallback={this.handleQueryChange}
              onBatchEditCallback={this.handleQueriesChange}
              onRemoveCallback={this.handleQueriesRemoval}
              onDuplicateCallback={this.handleQueryDuplication}
              onDraftHistoryUndoCallback={this.handleDraftHistoryUndo}
              onGetStatementsCallback={this.handleGetStatements}
              onCreateDraftStatementCallback={this.handleCreateDraftStatement}
              onUpdateStatementCallback={this.handleUpdateStatement}
              onDeleteStatementCallback={this.handleDeleteStatement}
              onSelectStatementCallback={this.handleSelectStatement}
              onDuplicateStatementCallback={this.handleDuplicateStatement}
              onSetDefaultStatementCallback={this.handleSetDefaultStatement}
              searchData={searchData}
              externalData={patient}
            />
          </Card>
          <Card className={`Content ${style.variantTable}`}>
            <Tabs key="variant-interpreter-tabs" activeKey={currentTab} onChange={this.handleTabChange}>
              <Tabs.TabPane tab="Variants" key={VARIANT_TAB}>
                { currentTab === VARIANT_TAB && (
                <InteractiveTable
                  key="variant-interactive-table"
                  isLoading={showSubloadingAnimation}
                  size={size}
                  page={page}
                  total={total}
                  schema={columnPreset[VARIANT_TAB]}
                  copyCallback={this.handleCopy}
                  pageChangeCallback={this.handlePageChange}
                  pageSizeChangeCallback={this.handlePageSizeChange}
                  isExportable={false}
                />
                ) }
              </Tabs.TabPane>
              <Tabs.TabPane tab="Genes" key={GENE_TAB} disabled>
                { currentTab === GENE_TAB && (
                <InteractiveTable
                  key="gene-interactive-table"
                  isLoading={showSubloadingAnimation}
                  size={size}
                  page={page}
                  total={total}
                  schema={columnPreset[GENE_TAB]}
                  pageChangeCallback={this.handlePageChange}
                  pageSizeChangeCallback={this.handlePageSizeChange}
                  copyCallback={this.handleCopy}
                  isExportable={false}
                />
                ) }
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Card>
        <Footer />
      </Content>
    );
  }
}

PatientVariantScreen.propTypes = {
  app: PropTypes.shape(appShape).isRequired,
  user: PropTypes.shape(userShape).isRequired,
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
    countVariants,
    commitHistory,
    undo,
    navigateToPatientScreen,
    getStatements,
    createDraftStatement,
    createStatement,
    updateStatement,
    deleteStatement,
    selectStatement,
    duplicateStatement,
    updateUserProfile,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  user: state.user,
  patient: state.patient,
  variant: state.variant,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientVariantScreen);
