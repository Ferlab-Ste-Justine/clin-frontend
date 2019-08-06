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
    this.isEditable = this.isEditable.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.serialize = this.serialize.bind(this);
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentWillMount() {
    const { options, data, visible } = this.props;
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
      const { onChangeCallback } = this.props;
      data.type = key;
      this.setState({
        data,
      }, () => { onChangeCallback(this.serialize()); });
    }
  }

  handleClose() {
    if (this.isEditable()) {
      const { onRemovalCallback } = this.props;
      this.setState({
        visible: false,
      }, () => { onRemovalCallback(this.serialize()); });
    }
  }

  createMenuComponent() {
    return (
      <Menu onClick={this.handleApply}>
        <Menu.Item key={OPERATOR_TYPE_AND}>AND</Menu.Item>
        <Menu.Item key={OPERATOR_TYPE_OR}>OR</Menu.Item>
      </Menu>
    );
  }

  render() {
    const { data } = this.state;
    const { type } = data;

    return (
      <Tag
        className="operator"
        visible={this.isVisible()}
      >
        { type }
        { this.isEditable() && (
        <Dropdown overlay={this.createMenuComponent} trigger={['click']} placement="bottomCenter">
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
  onRemovalCallback: PropTypes.func,
  onChangeCallback: PropTypes.func,
  visible: PropTypes.bool,
};

Operator.defaultProps = {
  options: {
    editable: false,
  },
  onRemovalCallback: () => {},
  onChangeCallback: () => {},
  visible: true,
};

export default Operator;
