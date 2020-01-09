/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';

import {
  find, cloneDeep, debounce,
} from 'lodash';

import {
  Menu, Input, AutoComplete, Icon, Tag, Typography, Col, Row,
} from 'antd';

import GenericFilter, { FILTER_OPERAND_TYPE_DEFAULT } from '../../../Query/Filter/Generic';
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
    this.searchQuery = '';
    this.handleFilterSelection = this.handleFilterSelection.bind(this);
    this.handleCategoryOpenChange = this.handleCategoryOpenChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterRemove = this.handleFilterRemove.bind(this);
    this.handleNavigationSearch = debounce(this.handleNavigationSearch.bind(this), 300, { leading: true });
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
            accumulator[result.id].matches.push(result)
            return accumulator;
          }, {});
          this.searchQuery = query;
          this.setState({
            searchResults: Object.values(groupedResults).filter(group => group.matches.length > 0),
          })
        })
      })
    } else if (this.searchQuery !== query) {
      this.searchQuery = query;
      this.setState({
        searchResults: [],
      })
    }
  }

  handleNavigationSelection(datum) {
    const selection = JSON.parse(datum)
    if (selection.type !== 'filter') {
      this.setState({
        activeFilterId: null,
        searchSelection: {
          category: selection.id,
          filter: selection.subid,
        },
        searchResults: [],
      })
    } else {
      const { activeQuery, queries } = this.props;
      this.setState({
        activeFilterId: null,
        searchSelection: {},
        searchResults: [],
      }, () => {
        const query = find(queries, { key: activeQuery })
        let filter = null
        if (query) {
          filter = find(query.instructions, (instruction) => instruction.data.id === selection.subid)
        }
        if (!filter) {
          filter = GenericFilter.structFromArgs(selection.subid, [selection.value])
        } else {
          if (filter.data.values.indexOf(selection.value) === -1) {
            filter.data.values.push(selection.value)
          }
        }
        this.handleFilterChange(filter);
      })
    }
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
  }

  handleCategoryOpenChange() {
      this.setState({
        activeFilterId: null,
        searchSelection: {},
      });
  }

  renderFilterType(categoryData){
    const { intl, activeQuery, queries, data, searchData, patient } = this.props;
    const { searchSelection } = this.state;
    const activeFilterId = searchSelection.filter ? searchSelection.filter : this.state.activeFilterId;
    const activeQueryData = find(queries, { key: activeQuery });
    const activeFilterForActiveQuery = activeQueryData ? find(activeQueryData.instructions, q => q.data.id === activeFilterId) : null;
    const defaultOperand = (categoryData.config && categoryData.config[categoryData.id].operands ? categoryData.config[categoryData.id].operands[0] : FILTER_OPERAND_TYPE_DEFAULT)

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
                  const datum = data[keyName]
                  if (datum && datum[0]) {
                    allOption.push({value:keyName , count: datum[0].count})
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
    let autocompletesCount = 0;
    const autocompletes = searchResults.map(group => {
      autocompletesCount += group.matches.length;
      return (
        <AutoComplete.OptGroup key={group.id} disabled label={(<Typography.Text strong>{group.label}</Typography.Text>)}>
          {group.matches.map((match) => (
            <AutoComplete.Option key={match.id} value={JSON.stringify(match)} style={{ maxHeight: 31 }} >
              <Col span={18}>
                <Typography.Text style={{ maxWidth: 210 }} ellipsis>
                  {match.value}
                </Typography.Text>
              </Col>
              <Col span={6} justify="end" align="end" style={{ minWidth: 50 }}>
                {match.count && (<Tag>{match.count}</Tag>)}
              </Col>
            </AutoComplete.Option>
          ))}
        </AutoComplete.OptGroup>
      )
    })
    if (this.searchQuery !== '') {
      autocompletes.unshift((<AutoComplete.Option key="count" disabled>
        <Typography.Text underline>{autocompletesCount} result(s)</Typography.Text>
      </AutoComplete.Option>))
    }

    const generateMenuComponent = (searchSelection, children) => {
      if (!searchSelection.category || !searchSelection.filter) {
        return (<Menu
                  mode="horizontal"
                  onOpenChange={this.handleCategoryOpenChange}
        ><Menu.SubMenu
            title={(
              <AutoComplete
                key="autocompleter"
                allowClear
                autoFocus
                size="large"
                dataSource={autocompletes}
                onSearch={this.handleNavigationSearch}
                onSelect={this.handleNavigationSelection}
                placeholder="Recherche de filtres"
              >
                <Input prefix={<Icon type="search"/>}/>
              </AutoComplete>
            )}
          />
          {children}</Menu>)
      }
        return (<Menu
                      mode="horizontal"
                      onOpenChange={this.handleCategoryOpenChange}
                      openKeys={[searchSelection.category]}
                      selectedKeys={[searchSelection.filter]}
        ><Menu.SubMenu
          title={(
            <AutoComplete
              key="autocompleter"
              allowClear
              autoFocus
              optionLabelProp="value"
              size="large"
              dataSource={autocompletes}
              onSearch={this.handleNavigationSearch}
              onSelect={this.handleNavigationSelection}
              placeholder="Recherche de filtres"
              value=""
            >
              <Input prefix={<Icon type="search" />}/>
            </AutoComplete>
          )}
        />
        {children}</Menu>)
    }

    return (
      <div className="variant-navigation">
        {generateMenuComponent(searchSelection, schema.categories ? schema.categories.map((category) => {
           if (category.filters && category.filters.length > 0) {
             const { id } = category;
             const label = intl.formatMessage({ id: `screen.patientvariant.${category.label}` });
             const categoryInfo = find(schema.categories, ['id', ( searchSelection.category || id)]);
             const categoryData = find(categoryInfo.filters, ['id', (searchSelection.filter || activeFilterId)]);
             const filter = categoryData ? this.renderFilterType(categoryData) : null
             return (
               <Menu.SubMenu key={id} title={<span>{label}</span>}>
                 { activeFilterId === null && !searchSelection.category && category.filters.map(filter => filter.search && (
                   <Menu.SubMenu
                     key={filter.id}
                     title={intl.formatMessage({ id: `screen.patientvariant.${filter.label}` })}
                     onTitleClick={this.handleFilterSelection}
                   />
                 ))}
                 { filter }
               </Menu.SubMenu>
             );
           }
           return null;
         }) : null )}
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
