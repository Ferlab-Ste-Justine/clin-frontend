/* eslint-disable camelcase, import/no-cycle, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Tag, Popover, Typography, Icon,
} from 'antd';

import { convertIndexToLetter } from './Statement';


export const INSTRUCTION_TYPE_SUBQUERY = 'subquery';
export const SUBQUERY_TYPE_INTERSECT = 'and';
export const SUBQUERY_TYPE_UNITE = 'or';
export const SUBQUERY_TYPE_SUBTRACT = 'and not';
// const SUBQUERY_TYPES = [SUBQUERY_TYPE_INTERSECT, SUBQUERY_TYPE_UNITE, SUBQUERY_TYPE_SUBTRACT];

export const createSubquery = (operand, query) => ({
  type: INSTRUCTION_TYPE_SUBQUERY,
  data: {
    query,
  },
});

const createPopoverBySubqueryType = (state) => {
  const { data } = state;
  const { type } = data;
  let content = null;

  switch (type) {
    case SUBQUERY_TYPE_UNITE:
      content = (
        <div>
          <Typography.Text>Subquery is an union [OR]</Typography.Text>
        </div>
      );
      break;
    case SUBQUERY_TYPE_SUBTRACT:
      content = (
        <div>
          <Typography.Text>Subquery is a subtraction [AND NOT]</Typography.Text>
        </div>
      );
      break;
    case SUBQUERY_TYPE_INTERSECT:
    default:
      content = (
        <div>
          <Typography.Text>Subquery is an intersection [AND]</Typography.Text>
        </div>
      );
      break;
  }

  return (
    <Popover
      className="legend"
      trigger="hover"
      placement="topLeft"
      content={content}
    >
      <Icon type="block" />
    </Popover>
  );
};


class Subquery extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
      draft: null,
      visible: null,
    };
    this.isEditable = this.isEditable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.serialize = this.serialize.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.createPopoverComponent = this.createPopoverComponent.bind(this);
  }

  componentWillMount() {
    const { data } = this.props;
    this.setState({
      data,
      draft: { ...data },
      visible: true,
    });
  }

  isEditable() {
    const { options } = this.props;
    const { editable } = options;
    return editable === true;
  }

  isSelectable() {
    const { options } = this.props;
    const { selectable } = options;
    return selectable === true;
  }

  isVisible() {
    const { visible } = this.state;
    return visible === true;
  }

  isSelected() {
    const { selected } = this.state;
    return selected === true;
  }

  serialize() {
    return Object.assign({}, this.props, this.state);
  }

  handleSelect() {
    if (this.isSelectable()) {
      this.setState({ selected: !this.isSelected() });
    }
  }

  createPopoverComponent() {
    return createPopoverBySubqueryType(this.state);
  }

  handleClose() {
    if (this.isEditable()) {
      const { onRemoveCallback } = this.props;
      this.setState({
        visible: false,
      }, () => { onRemoveCallback(this.serialize()); });
    }
  }

  render() {
    const { queryIndex } = this.props;
    const { data } = this.state;
    const { query } = data;
    const popover = this.createPopoverComponent();
    if (queryIndex === -1) {
      this.handleClose();
      return null;
    }

    return (
      <Tag
        className="subquery"
        visible={this.isVisible()}
        closable={this.isEditable()}
        onClose={this.handleClose}
        color={this.isSelected() ? 'blue' : ''}
      >
        {popover}
        <span onClick={this.handleSelect}>
          {(`Query #${(queryIndex !== null ? convertIndexToLetter(queryIndex) : query)}`)}
        </span>
      </Tag>
    );
  }
}

Subquery.propTypes = {
  queryIndex: PropTypes.number,
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  onRemoveCallback: PropTypes.func,
};

Subquery.defaultProps = {
  queryIndex: null,
  options: {
    editable: false,
    selectable: false,
  },
  onRemoveCallback: () => {},
};

export default Subquery;
