/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash';
import { Menu, Input, AutoComplete, Icon, Tag } from 'antd';
import GenericFilter from '../../../Query/Filter/Generic';
import NumericalComparisonFilter from '../../../Query/Filter/NumericalComparison';
import {FILTER_TYPE_GENERIC , FILTER_TYPE_NUMERICAL_COMPARISON} from '../../../Query/Filter/index'


class VariantNavigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeFilterId: null,
      searchResults: [],
    };
    this.handleFilterSelection = this.handleFilterSelection.bind(this);
    this.handleCategoryOpenChange = this.handleCategoryOpenChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterRemove = this.handleFilterRemove.bind(this);
    this.handleNavigationSearch = this.handleNavigationSearch.bind(this);
    this.handleNavigationSelection = this.handleNavigationSelection.bind(this);
    this.renderFilterType = this.renderFilterType.bind(this);
  }

  handleNavigationSearch(query) {
    if (query) {
      const { searchData } = this.props
      const normalizedQuery = query.toLowerCase()
      const searchResults = searchData.reduce((accumulator, group) => {
        const matches = group.data.filter((datum) => {
          if (datum.value.toLowerCase) {
            return datum.value.toLowerCase()
              .indexOf(normalizedQuery) !== -1
          }
          return false;
        })

        if (matches.length > 0) {
          accumulator.push({
            id: group.id,
            type: group.type,
            label: group.label,
            matches,
          })
        }

        return accumulator
      }, [])

      this.setState({
        searchResults
      })
    }
  }

  handleNavigationSelection(value, option) {
    console.log('handleNavigationSelection', value, option);
  }

  handleFilterSelection({ key }) {
    this.setState({
      activeFilterId: key,
    });
  }

  handleFilterRemove(filter) {
    this.props.onRemoveInstructionCallback(filter);
  }

  handleFilterChange(filter) {
    this.props.onAddInstructionCallback(filter);
  }

  handleCategoryOpenChange(keys) {
    this.setState({
      activeFilterId: null,
    });
  }

  renderFilterType(type){
    const { intl, activeQuery, schema, queries, data } = this.props;
    const { activeFilterId, searchResults } = this.state;
    const activeQueryData = find(queries, { key: activeQuery });
    const activeFilterForActiveQuery = activeQueryData ? find(activeQueryData.instructions, q => q.data.id === activeFilterId) : null;
    switch (type) {
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
                data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : { id: activeFilterId, operand: 'all' })}
                dataSet={data[activeFilterId] ? data[activeFilterId] : []}
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
                  data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : { id: activeFilterId, comparator: ">", value: 0 , type:"numcomparison"})}
                  dataSet={data[activeFilterId] ? data[activeFilterId] : []}
                  onEditCallback={this.handleFilterChange}
                  onRemoveCallback={this.handleFilterRemove}
                  onCancelCallback={this.handleCategoryOpenChange}
                />
              );
    }

  }

  render() {
    const { intl, schema, data } = this.props;
    const { activeFilterId, searchResults } = this.state;
    const autocompletes = searchResults.map((group) => {
      return (
          <AutoComplete.OptGroup key={group.id} label={(<span>{group.label}</span>)}>
            { group.matches.map((match) => (
              <AutoComplete.Option key={match.id} group={group} value={match.value} disabled>
                {match.value} {match.count && (<Tag>{match.count}</Tag>)}
              </AutoComplete.Option>
            ))}
          </AutoComplete.OptGroup>
        )
    })

    return (
      <div className="variant-navigation">
        <Menu key="category-navigator" mode="horizontal" onOpenChange={this.handleCategoryOpenChange}>
          <Menu.SubMenu
            key="search"
            title={(
                <AutoComplete
                  allowClear
                  autoFocus
                  optionLabelProp="value"
                  size="large"
                  dataSource={autocompletes}
                  onSelect={this.handleNavigationSelection}
                  onChange={this.handleNavigationSearch}
                  placeholder="Recherche de filtres"
                >
                  <Input prefix={<Icon type="search" />} />
                </AutoComplete>
            )}
          />
          {schema.categories && schema.categories.map((category) => {
            if (category.filters && category.filters.length > 0) {
              const { id } = category;
              const {searchData} = this.props
              const label = intl.formatMessage({ id: `screen.patientvariant.${category.label}` });

              const categoryInfo =find(schema.categories, ['id', id]);
              const categoryData = find(categoryInfo.filters, ['id', activeFilterId]);
              const type = categoryData ? this.renderFilterType(categoryData.type) : null
              return (
                <Menu.SubMenu key={id} title={<span>{label}</span>}>
                  { activeFilterId === null && category.filters.map(filter => filter.search && (
                  <Menu.SubMenu
                    key={filter.id}
                    title={intl.formatMessage({ id: `screen.patientvariant.${filter.label}` })}
                    onTitleClick={this.handleFilterSelection}
                  />
                  ))}
                  { activeFilterId !== null && (
                      type
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
  data: PropTypes.shape({}),
  queries: PropTypes.array,
  activeQuery: PropTypes.string,
  onEditCallback: PropTypes.func,
  onAddInstructionCallback: PropTypes.func
};

VariantNavigation.defaultProps = {
  onEditCallback: () => {},
  data: [],
  queries: [],
  activeQuery: '',
};

export default VariantNavigation;
