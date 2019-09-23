/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
    find, findAll,
} from 'lodash';

import {
  Menu, Input,
} from 'antd';

import GenericFilter from '../../Query/Filter/Generic';

import {
    fetchSchema,
} from '../../../actions/variant';
import { patientShape } from '../../../reducers/patient';
import { variantShape } from '../../../reducers/variant';


class VariantNavigation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeCategoryId: null,
            activeFilterId: null,
            data: null,
        }
        this.handleFilterSearch = this.handleFilterSearch.bind(this);
        this.handleFilterSelection = this.handleFilterSelection.bind(this);
        this.handleCategoryOpenChange = this.handleCategoryOpenChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this)
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

    handleFilterSelection({ key, domEvent }) {
        this.setState({
            activeFilterId: key
        });
        // const ul = domEvent.currentTarget.parentNode.parentNode;
        // ul.classList.add('ant-menu-hidden');
    }

    handleFilterChange(filter) {
        const {onEditCallback} = this.props
        if(onEditCallback){
            onEditCallback(filter)
        }
    }

    handleCategoryOpenChange(keys) {
        this.setState({
            activeCategoryId: keys[0] || null,
            activeFilterId: null,
        })
    }

    render() {
        const { intl, variant } = this.props;
        const { activeFilterId } = this.state;
        const { activeQuery, schema, queries } = variant;
        const activeQueryData = find(queries, {'key': activeQuery});
        const queryFilter = activeQueryData ? find(activeQueryData.instructions, (q) => { return q.data.id === activeFilterId; }) : null;

        return (<div className="variant-navigation">
            <Menu key="category-navigator" mode="horizontal" onOpenChange={this.handleCategoryOpenChange}>
                <Menu.SubMenu key="search" title={(<Input.Search
                    placeholder="Recherche de filtres"
                    onSearch={this.handleFilterSearch}
                />)}/>
                {schema.categories && schema.categories.map((category) => {
                    if (category.filters && category.filters.length > 0) {
                        const id = category.id;
                        const label = intl.formatMessage({id: `screen.variantsearch.${category.label}`});
                        return (<Menu.SubMenu key={id} title={<span>{label}</span>}>
                            { activeFilterId === null && category.filters.map((filter) => {
                                return (<Menu.SubMenu key={filter.id}
                                      title={intl.formatMessage({id: `screen.variantsearch.${filter.label}`})}
                                      onTitleClick={this.handleFilterSelection}
                                />);
                            })}
                            { activeFilterId !== null && (<GenericFilter
                                overlayOnly={true}
                                autoOpen={true}
                                options={{
                                    editable: true,
                                    selectable: false,
                                    removable: false,
                                }}
                                intl={intl}
                                data={(queryFilter ? queryFilter.data : {})}
                                onEditCallback={this.handleFilterChange}
                                onCancelCallback={this.handleCategoryOpenChange}
                            />)}

                        </Menu.SubMenu>);
                }
            })}
            </Menu>
        </div>);
    }
}

VariantNavigation.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
  variant: PropTypes.shape(variantShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

VariantNavigation.defaultProps = {
    onEditCallback: () => {},
};


const mapStateToProps = state => ({
  intl: state.intl,
  patient: state.patient,
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
