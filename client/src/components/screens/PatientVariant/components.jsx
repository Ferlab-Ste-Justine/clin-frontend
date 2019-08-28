/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
    pull
} from 'lodash';

import {
  Col, Row, Layout, Menu, Icon, Input,
} from 'antd';

import Filter, {INSTRUCTION_TYPE_FILTER, FILTER_TYPES, FILTER_TYPE_GENERIC} from '../../Query/Filter/index';

import {
    fetchSchema,
} from '../../../actions/variant';
import { variantShape } from '../../../reducers/variant';





class VariantNavigation extends React.Component {

    constructor() {
        super();
        this.state = {
            filter: null,
        }
        this.handleFilterSelection = this.handleFilterSelection.bind(this);
        this.handleFilterOpenChange = this.handleFilterOpenChange.bind(this);
    }

    componentDidMount() {
        const { actions, variant } = this.props;
        const { schema } = variant;
        // @NOTE Make sure we have a schema defined in redux
        if (!schema.version) {
            actions.fetchSchema();
        }
    }

    handleFilterSelection(key) {
        this.setState({
            filter: key
        })
    }

    handleFilterOpenChange(keys) {
        console.log(keys);
    }

    // mode="inline"

    render() {
        const { intl, variant } = this.props;
        const { filter } = this.state;
        const { schema } = variant;

        return (<div className="variant-navigation">
            <Menu mode="horizontal">
            <Menu.SubMenu title={(<Input placeholder="Recherche de filtres"/>)}/>
            {schema.categories && schema.categories.map((category) => {
                if (category.filters && category.filters.length > 0) {
                    const id = category.id;
                    const label = intl.formatMessage({id: `screen.variantsearch.${category.label}`});
                    if (!filter) {
                        return (<Menu.SubMenu key={id} title={<span>{label}</span>}>
                            {category.filters.map((filter) => {
                                return (<Menu key={filter.id}
                                                      title={intl.formatMessage({id: `screen.variantsearch.${filter.label}`})}
                                                      onTitleClick={this.handleFilterSelection}
                                                      // onOpenChange={this.handleFilterOpenChange}
                                >
                                </Menu>);
                            })}
                        </Menu.SubMenu>)
                    }

                    return (<Menu.SubMenu key={id} title={<span>{label}</span>}>
                        <Filter
                            visible={true}
                            autoopen={true}
                            options={{
                                editable: true,
                                selectable: false,
                                removable: false,
                            }}
                            data={{
                                type: 'filter',
                                data: {
                                    type: 'generic',
                                }
                            }}
                        />
                    </Menu.SubMenu>)
                }
            })}
            </Menu></div>);
    }
}

VariantNavigation.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  variant: PropTypes.shape(variantShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
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
        fetchSchema
    }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(VariantNavigation));
