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
    this.state.data = { ...data };
    this.state.options = {
      editable: options.editable || true,
    };
    this.state.visible = visible;
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
    const { intl } = this.props;
    const andText = intl.formatMessage({ id: 'screen.patientVariant.statement.and' });
    const orText = intl.formatMessage({ id: 'screen.patientVariant.statement.or' });
    const andNotText = intl.formatMessage({ id: 'screen.patientVariant.statement.andnot' });
    return (
      <Menu onClick={this.handleApply}>
        <Menu.Item key={OPERATOR_TYPE_AND}>{andText}</Menu.Item>
        <Menu.Item key={OPERATOR_TYPE_OR}>{orText}</Menu.Item>
        <Menu.Item key={OPERATOR_TYPE_AND_NOT}>{andNotText}</Menu.Item>
      </Menu>
    );
  }

  render() {
    const { intl } = this.props;
    const { data } = this.state;
    const { type } = data;
    const typeText = intl.formatMessage({ id: `screen.patientVariant.statement.${type.replace(' ', '')}` });
    return (
      <span>
        { this.isEditable() && (
        <Dropdown overlay={this.createMenuComponent} trigger={['click']}>
          <Tag
            className="operator"
            visible={this.isVisible()}
            onClick={this.createMenuComponent}
          >
            { typeText }
            { <Icon type="caret-down" /> }
          </Tag>
        </Dropdown>
        ) }
      </span>
    );
  }
}

Operator.propTypes = {
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  onEditCallback: PropTypes.func,
  visible: PropTypes.bool,
  intl: PropTypes.shape({}).isRequired,
};

Operator.defaultProps = {
  options: {
    editable: false,
  },
  onEditCallback: () => {},
  visible: true,
};

export default Operator;
