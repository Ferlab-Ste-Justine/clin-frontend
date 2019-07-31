/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Tag, Menu, Dropdown, Icon,
} from 'antd';


export const OPERATOR_TYPE_AND = 'and';
export const OPERATOR_TYPE_OR = 'or';


class Operator extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
      options: {
        editable: null,
      },
      visible: null,
    };
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
  }

  componentWillMount() {
    const { options, data } = this.props;
    this.setState({
      data,
      options,
      visible: true,
    });
  }

  handleSelection({ key }) {
    const { data } = this.state;
    if (data.type !== key) {
        data.type = key;
        this.setState({
            data
        })
    }
  }

    handleOperatorClose() {
        const { editable } = this.state.options;
        const { removalCallback } = this.props;
        if (editable) {
            this.setState({
                visible: false,
            })
            const operator = Object.assign({}, this.props, this.state);
            removalCallback(operator);
        }
    }


    createMenuComponent() {
    return (
      <Menu onClick={this.handleSelection}>
        <Menu.Item key={OPERATOR_TYPE_AND}>AND</Menu.Item>
        <Menu.Item key={OPERATOR_TYPE_OR}>OR</Menu.Item>
      </Menu>
    );
  }

  render() {
    const { data, options, visible } = this.state;
    const { editable } = options;

    return (
      <Tag
        className="operator"
        visible={visible}
      >
        { data.type }
        { editable && (
            <Dropdown overlay={this.createMenuComponent} trigger={['click']} placement="bottomRight">
              { <Icon type="caret-down" /> }
            </Dropdown>
        ) }
      </Tag>
    );
  }
}

Operator.propTypes = {
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  removalCallback: PropTypes.func,
};

Operator.defaultProps = {
  options: {
    editable: false,
  },
  removalCallback: () => {},
};

export default Operator;
