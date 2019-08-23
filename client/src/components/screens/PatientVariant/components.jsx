/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Col, Row, Layout, Menu, Icon, Input,
} from 'antd';

import Filter, { INSTRUCTION_TYPE_FILTER, FILTER_TYPES } from '../../Query/Filter/index';

import {
    fetchSchema,
} from '../../../actions/variant';
import { variantShape } from '../../../reducers/variant';





class VariantNavigation extends React.Component {

    constructor() {
        super();
        this.state = {

        }
        this.handleFilterChange = this.handleFilterChange.bind(this);
    }

    componentDidMount() {
        const { actions, variant } = this.props;
        const { schema } = variant;
        // @NOTE Make sure we have a schema defined in redux
        if (!schema.version) {
            actions.fetchSchema();
        }
    }

    handleFilterChange(e) {
        console.log('===-- handleFilterChange --===');
        console.log(e);
    }

    render() {
        const { intl, variant } = this.props;
        const { schema } = variant;

        return (<div className="variant-navigation">
            <Menu mode="horizontal">
            <Menu.SubMenu title={(<Input placeholder="Recherche de filtres"/>)}></Menu.SubMenu>
            {schema.categories && schema.categories.map((category) => {

                const id = category.id;
                const label = intl.formatMessage({ id: `screen.variantsearch.${category.label}` });

                const filters = category.filters.map((filter) => {
                    return (<Menu.SubMenu
                        key={filter.id}
                        title={intl.formatMessage({ id: `screen.variantsearch.${filter.label}`})}
                    />);
                })



                return (<Menu.SubMenu key={id} title={<span>{label}</span>}>
                        {[...filters]}
                </Menu.SubMenu>)


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
