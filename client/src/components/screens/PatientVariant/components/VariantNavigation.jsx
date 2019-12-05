/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';

import {
  find, cloneDeep, debounce,
} from 'lodash';

import {
  Menu, Input, AutoComplete, Icon, Tag,
} from 'antd';

import GenericFilter from '../../../Query/Filter/Generic';
import SpecificFilter from '../../../Query/Filter/Specific';
import NumericalComparisonFilter from '../../../Query/Filter/NumericalComparison';
import GenericBooleanFilter from '../../../Query/Filter/GenericBoolean';
import CompositeFilter from '../../../Query/Filter/Composite';
import { sanitizeInstructions } from '../../../Query/index';
import {FILTER_TYPE_GENERIC , FILTER_TYPE_NUMERICAL_COMPARISON, FILTER_TYPE_GENERICBOOL, FILTER_TYPE_COMPOSITE, FILTER_TYPE_SPECIFIC} from '../../../Query/Filter/index'


class VariantNavigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeFilterId: null,
      searchSelection: {},
      searchResults: [],
    };
    this.handleFilterSelection = this.handleFilterSelection.bind(this);
    this.handleCategoryOpenChange = this.handleCategoryOpenChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterRemove = this.handleFilterRemove.bind(this);
    this.handleNavigationSearch = debounce(this.handleNavigationSearch.bind(this), 500, { leading: true });
    this.handleNavigationSelection = this.handleNavigationSelection.bind(this);
    this.renderFilterType = this.renderFilterType.bind(this);
  }

  handleNavigationSearch(query) {
    if (query && query.length > 1) {
      const { autocomplete } = this.props
      autocomplete.then(engine => {
        engine.search(query, searchResults => {
          const groupedResults = searchResults.reduce((accumulator, result) => {
            if (!accumulator[result.id]) {
              accumulator[result.id] = {
                id: result.id,
                type: result.type,
                label: result.label,
                matches: []
              }
            }
            accumulator[result.id].matches.push({
              id: result.id,
              value: result.value,
              subid: result.type === 'category' ? result.subid : null,
              count: result.type === 'filter' ? result.count : null
            })
            return accumulator;
          }, {});

          this.setState({
            searchResults: Object.values(groupedResults).filter(group => group.matches.length > 0),
          })
        })
      })
    }
  }

  handleNavigationSelection(datum) {
    const selection = JSON.parse(datum);
    console.log('+ handleNavigationSelection');
    console.log('+ selection ' + JSON.stringify(datum));

    if (selection.type === "category") {
      this.setState({
        activeFilterId: selection.subgroup,
        searchSelection: {
          category: selection.group,
          filter: selection.subgroup,
        }
      })
    } else if (selection.type === "filter") {
      this.setState({
        activeFilterId: selection.group,
        searchSelection: {
          category: selection.group,
          filter: selection.group,
        }
      })
    }


    /*

"{\"group\":\"variant\",\"type\":\"category\",\"value\":\"Conséquence\"}"
"{\"group\":\"transmission\",\"type\":\"filter\",\"key\":\"transmission\",\"value\":\"HOM\"}"
     */



  }

  handleFilterSelection({ key }) {
    this.setState({
      activeFilterId: key,
      searchSelection: {},
    });
  }

  handleFilterRemove(filter) {
    filter.remove = true
    this.handleFilterChange(filter)
  }

  handleFilterChange(filter) {
    try {
      const { onEditCallback } = this.props;
      if (onEditCallback) {
        const { activeQuery, queries } = this.props;
        const query = find(queries, { key: activeQuery })
        if (query) {
          const updatedQuery = cloneDeep(query);
          let updatedInstructions = []
          if (!filter.remove) {
            let updated = false
            updatedInstructions = updatedQuery.instructions.map((instruction) => {
              if (instruction.data.id === filter.id) {
                updated = true
                return {
                  type: 'filter',
                  data: filter
                };
              }
              return instruction;
            })
            if (!updated) {
              updatedInstructions.push({
                type: 'filter',
                data: filter
              })
            }
          } else {
            updatedInstructions = updatedQuery.instructions.filter((instruction) => {
              if (instruction.data.id === filter.id) {
                return false;
              }
              return true;
            })
          }
          updatedQuery.instructions = sanitizeInstructions(updatedInstructions);
          onEditCallback(updatedQuery);
        }
      }
    } catch (e) {
      console.log('+ e ' + JSON.stringify(e))
    }
  }

  handleCategoryOpenChange(keys) {
    this.setState({
      activeFilterId: null,
      selectedMenu: null,
      selectedSubMenu: null,
    });
  }

  renderFilterType(categoryData){
    const { intl, activeQuery, queries, data, searchData, patient } = this.props;
    const { activeFilterId } = this.state;
    const activeQueryData = find(queries, { key: activeQuery });
    const activeFilterForActiveQuery = activeQueryData ? find(activeQueryData.instructions, q => q.data.id === activeFilterId) : null;
    const defaultOperand = (categoryData.config && categoryData.config[categoryData.id].operands ? categoryData.config[categoryData.id].operands[0] : 'all' )

    switch (categoryData.type) {
        case FILTER_TYPE_GENERIC:
            return (
              <GenericFilter
                overlayOnly
                autoOpen
                options={{
                  editable: true,
                  selectable: false,
                  removable: false,
                }}
                intl={intl}
                data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : { id: activeFilterId, operand: defaultOperand})}
                dataSet={data[activeFilterId] ? data[activeFilterId] : []}
                config={categoryData.config && categoryData.config[categoryData.id]}
                onEditCallback={this.handleFilterChange}
                onRemoveCallback={this.handleFilterRemove}
                onCancelCallback={this.handleCategoryOpenChange}
              />
            );
            case FILTER_TYPE_SPECIFIC:
              return (
                <SpecificFilter
                  overlayOnly
                  autoOpen
                  options={{
                    editable: true,
                    selectable: false,
                    removable: false,
                  }}
                  intl={intl}
                  data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : { id: activeFilterId, operand: defaultOperand})}
                  dataSet={data[activeFilterId] ? data[activeFilterId] : []}
                  externalDataSet={patient}
                  config={categoryData.config && categoryData.config[categoryData.id]}
                  onEditCallback={this.handleFilterChange}
                  onRemoveCallback={this.handleFilterRemove}
                  onCancelCallback={this.handleCategoryOpenChange}
                />
              );
            case FILTER_TYPE_NUMERICAL_COMPARISON:
              return (
                <NumericalComparisonFilter
                  overlayOnly
                  autoOpen
                  options={{
                    editable: true,
                    selectable: false,
                    removable: false,
                  }}
                  intl={intl}
                  data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : { id: activeFilterId, comparator: ">", value: 0 , type:NumericalComparisonFilter})}
                  dataSet={data[activeFilterId] ? data[activeFilterId] : []}
                  onEditCallback={this.handleFilterChange}
                  onRemoveCallback={this.handleFilterRemove}
                  onCancelCallback={this.handleCategoryOpenChange}
                />
              );
            case FILTER_TYPE_GENERICBOOL:
              const allOption = []
              Object.keys(categoryData.search).map((keyName) => {
                  const data = find(searchData, ['id', keyName])
                  if (data && data.data[0]) {
                    const count = data.data[0].count
                    allOption.push({value:keyName , count:count})
                  }
                }
              )
              return (
                <GenericBooleanFilter
                  overlayOnly
                  autoOpen
                  options={{
                    editable: true,
                    selectable: false,
                    removable: false,
                  }}
                  intl={intl}
                  data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : { id: activeFilterId, type:FILTER_TYPE_GENERICBOOL})}
                  dataSet={allOption ? allOption : []}
                  onEditCallback={this.handleFilterChange}
                  onRemoveCallback={this.handleFilterRemove}
                  onCancelCallback={this.handleCategoryOpenChange}
                />
              );
          case FILTER_TYPE_COMPOSITE:
            return (
              <CompositeFilter
                overlayOnly
                autoOpen
                options={{
                  editable: true,
                  selectable: false,
                  removable: false,
                }}
                intl={intl}
                data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : {
                  id: activeFilterId, comparator: '>'
                })}
                dataSet={data[activeFilterId] ? data[activeFilterId] : []}
                onEditCallback={this.handleFilterChange}
                onRemoveCallback={this.handleFilterRemove}
                onCancelCallback={this.handleCategoryOpenChange}
              />
            );
    }
  }

  render() {
    const { intl, schema } = this.props;
    const { activeFilterId, searchResults, searchSelection } = this.state;
    const autocompletes = searchResults.map(group => (
      <AutoComplete.OptGroup key={group.id} label={(<span>{group.label}</span>)}>
        { group.matches.map((match) => (
          <AutoComplete.Option key={match.id} value={JSON.stringify({ type: group.type, group: group.id, subgroup: match.subid, value: match.value })}>
            {match.value} {match.count && (<Tag>{match.count}</Tag>)}
          </AutoComplete.Option>
        ))}
      </AutoComplete.OptGroup>
    ))

    console.log('+ activeFilterId ' + activeFilterId);
    console.log('+ searchSelection ' + JSON.stringify(searchSelection));




    /*
    searchSelection: {
      category: selection.group,
        filter: selection.subgroup,
    }
    }*/





    return (
      <div className="variant-navigation">
        <Menu key="category-search" mode="vertical">
          <Menu.SubMenu
            key="search"
            title={(
              <AutoComplete
                allowClear
                autoFocus
                size="large"
                optionLabelProp="key"
                dataSource={autocompletes}
                placeholder="Recherche de filtres"
                onSearch={this.handleNavigationSearch}
                onSelect={this.handleNavigationSelection}
              >
                <Input prefix={<Icon type="search" />} />
              </AutoComplete>
            )}
          />
        </Menu>
        <Menu key="category-navigator" mode="horizontal" openKeys={[searchSelection.group, activeFilterId]} onOpenChange={this.handleCategoryOpenChange}>
          {schema.categories && schema.categories.map((category) => {
            if (category.filters && category.filters.length > 0) {
              const { id } = category;
              const label = intl.formatMessage({ id: `screen.patientvariant.${category.label}` });
              const categoryInfo = find(schema.categories, ['id', id]);
              let categoryData = find(categoryInfo.filters, ['id', activeFilterId]);
              if (!categoryData) {
                find(categoryInfo.filters, ['id', searchSelection.filter]);
              }
              const filter = categoryData ? this.renderFilterType(categoryData) : null

              console.log(' + activeFilterId ' + activeFilterId)
              console.log(' + id ' + id)
              console.log(' + filter ' + JSON.stringify(filter))



              return (
                <Menu.SubMenu key={id} title={<span>{label}</span>}>
                  { activeFilterId === null && category.filters.map(filter => filter.search && (
                  <Menu.SubMenu
                    key={filter.id}
                    title={intl.formatMessage({ id: `screen.patientvariant.${filter.label}` })}
                    onTitleClick={this.handleFilterSelection}
                    isOpen={(searchSelection.category === id)}
                    forceRender={true}
                  />
                  ))}
                  { activeFilterId !== null && (
                    filter
                  )}
                </Menu.SubMenu>
              );
            }
            return null;
          })}
        </Menu>
      </div>
    );
  }
}

VariantNavigation.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  schema: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}),
  queries: PropTypes.array,
  activeQuery: PropTypes.string,
  onEditCallback: PropTypes.func,
};

VariantNavigation.defaultProps = {
  onEditCallback: () => {},
  data: [],
  queries: [],
  activeQuery: '',
};

export default VariantNavigation;
