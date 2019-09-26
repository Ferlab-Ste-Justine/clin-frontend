/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  find, cloneDeep,
} from 'lodash';

import {
  Menu, Input,
} from 'antd';

import GenericFilter from '../../Query/Filter/Generic';

import {
  fetchSchema,
} from '../../../actions/variant';
import { variantShape } from '../../../reducers/variant';


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

    // @NOTE Initialize Component State
    const { actions, variant } = props;
    const { schema } = variant;
    // @NOTE Make sure we have a schema defined in redux
    if (!schema.version) {
      actions.fetchSchema();
    }
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
      const { variant } = this.props;
      const { activeQuery, queries } = variant;
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
    const { intl, variant } = this.props;
    const { activeFilterId } = this.state;
    const { activeQuery, schema, queries } = variant;
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
  variant: PropTypes.shape(variantShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
  onEditCallback: PropTypes.func,
};

VariantNavigation.defaultProps = {
  onEditCallback: () => {},
};

const mapStateToProps = state => ({
  intl: state.intl,
  variant: state.variant,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    fetchSchema,
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(VariantNavigation));
