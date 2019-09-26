/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';

import {
  find, cloneDeep,
} from 'lodash';

import {
  Menu, Input,
} from 'antd';

import GenericFilter from '../../Query/Filter/Generic';



class VariantNavigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeFilterId: null,
    };
    this.handleFilterSearch = this.handleFilterSearch.bind(this);
    this.handleFilterSelection = this.handleFilterSelection.bind(this);
    this.handleCategoryOpenChange = this.handleCategoryOpenChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterRemove = this.handleFilterRemove.bind(this);
  }

  handleFilterSearch(query) {
    console.log('handleFilterSelection query');
  }

  handleFilterSelection({ key }) {
    this.setState({
      activeFilterId: key,
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
            updatedInstructions = updatedQuery.instructions.map((instruction) => {
              if (instruction.data.id === filter.data.id) {
                  return { type: 'filter', data: filter.data };
              }
              return instruction;
            })
          } else {
            updatedInstructions = updatedQuery.instructions.filter((instruction) => {
              if (instruction.data.id === filter.data.id) {
                return false;
              }
              return true;
            })
          }
          updatedQuery.instructions = updatedInstructions;
          onEditCallback(updatedQuery);
      }
    }
  }

  handleCategoryOpenChange(keys) {
    this.setState({
      activeFilterId: null,
    });
  }

  render() {
    const { intl, activeQuery, schema, queries, data } = this.props;
    const { activeFilterId } = this.state;
    const activeQueryData = find(queries, { key: activeQuery });
    const activeFilterForActiveQuery = activeQueryData ? find(activeQueryData.instructions, q => q.data.id === activeFilterId) : null;

    return (
      <div className="variant-navigation">
        <Menu key="category-navigator" mode="horizontal" onOpenChange={this.handleCategoryOpenChange}>
          <Menu.SubMenu
            key="search"
            title={(
              <Input.Search
                placeholder="Recherche de filtres"
                onSearch={this.handleFilterSearch}
              />
)}
          />
          {schema.categories && schema.categories.map((category) => {
            if (category.filters && category.filters.length > 0) {
              const { id } = category;
              const label = intl.formatMessage({ id: `screen.variantsearch.${category.label}` });
              return (
                <Menu.SubMenu key={id} title={<span>{label}</span>}>
                  { activeFilterId === null && category.filters.map(filter => filter.facet && (
                  <Menu.SubMenu
                    key={filter.id}
                    title={intl.formatMessage({ id: `screen.variantsearch.${filter.label}` })}
                    onTitleClick={this.handleFilterSelection}
                  />
                  ))}
                  { activeFilterId !== null && (
                  <GenericFilter
                    overlayOnly
                    autoOpen
                    options={{
                      editable: true,
                      selectable: false,
                      removable: false,
                    }}
                    intl={intl}
                    data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : {})}
                    dataSet={data[activeFilterId] ? data[activeFilterId] : []}
                    onEditCallback={this.handleFilterChange}
                    onRemoveCallback={this.handleFilterRemove}
                    onCancelCallback={this.handleCategoryOpenChange}
                  />
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
};

VariantNavigation.defaultProps = {
  onEditCallback: () => {},
  data: [],
  queries: [],
  activeQuery: '',
};

export default VariantNavigation;
