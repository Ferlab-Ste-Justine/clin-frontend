import React from 'react';
import PropTypes from 'prop-types';
import {
  Tag, Menu, Dropdown, Icon,
} from 'antd';


export const INSTRUCTION_TYPE_OPERATOR = 'operator';
export const OPERATOR_TYPE_AND = 'and';
export const OPERATOR_TYPE_OR = 'or';
export const OPERATOR_TYPE_AND_NOT = 'and not';
export const OPERATOR_TYPES = [OPERATOR_TYPE_AND, OPERATOR_TYPE_OR, OPERATOR_TYPE_AND_NOT];

export const createOperator = operand => ({
  type: INSTRUCTION_TYPE_OPERATOR,
  data: {
    type: (OPERATOR_TYPES.indexOf(operand) !== -1 ? operand : OPERATOR_TYPE_AND),
  },
});

class Operator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      options: {
        editable: null,
      },
      visible: null,
    };
    this.isEditable = this.isEditable.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.serialize = this.serialize.bind(this);
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.handleApply = this.handleApply.bind(this);

    // @NOTE Initialize Component State
    const { options, data, visible } = props;
    this.setState({
      data: { ...data },
      options: {
        editable: options.editable || true,
      },
      visible,
    });
  }

  isEditable() {
    const { options } = this.state;
    const { editable } = options;
    return editable === true;
  }

  isVisible() {
    const { visible } = this.state;
    return visible === true;
  }

  serialize() {
    return Object.assign({}, this.props, this.state);
  }

  handleApply({ key }) {
    const { data } = this.state;
    if (this.isEditable() && data.type !== key) {
      const { onEditCallback } = this.props;
      data.type = key;
      this.setState({
        data,
      }, () => { onEditCallback(this.serialize()); });
    }
  }

  createMenuComponent() {
    return (
      <Menu onClick={this.handleApply}>
        <Menu.Item key={OPERATOR_TYPE_AND}>AND</Menu.Item>
        <Menu.Item key={OPERATOR_TYPE_OR}>OR</Menu.Item>
        <Menu.Item key={OPERATOR_TYPE_AND_NOT}>AND NOT</Menu.Item>
      </Menu>
    );
  }

  render() {
    const { data } = this.state;
    const { type } = data;

    return (
      <span>
        <Tag
          className="operator"
          visible={this.isVisible()}
        >
          { type }
          { this.isEditable() && (
          <Dropdown overlay={this.createMenuComponent} trigger={['click']}>
            { <Icon type="caret-down" /> }
          </Dropdown>
          ) }
        </Tag>
      </span>
    );
  }
}

Operator.propTypes = {
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  onEditCallback: PropTypes.func,
  visible: PropTypes.bool,
};

Operator.defaultProps = {
  options: {
    editable: false,
  },
  onEditCallback: () => {},
  visible: true,
};

export default Operator;
