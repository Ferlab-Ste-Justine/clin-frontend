/* eslint-disable */
/* eslint-disable import/no-cycle, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Tag, Popover, Typography, Icon,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_cancel, /* eslint-disable-line */
} from 'react-icons-kit/md';
import style from './term.module.scss';

export const INSTRUCTION_TYPE_SUBQUERY = 'subquery';
export const SUBQUERY_TYPE_INTERSECT = 'and';
export const SUBQUERY_TYPE_UNITE = 'or';
export const SUBQUERY_TYPE_SUBTRACT = 'and not';
export const SUBQUERY_TYPES = [SUBQUERY_TYPE_INTERSECT, SUBQUERY_TYPE_UNITE, SUBQUERY_TYPE_SUBTRACT];

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
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      draft: null,
      visible: true,
      selected: false,
    };
    this.isEditable = this.isEditable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.serialize = this.serialize.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.createPopoverComponent = this.createPopoverComponent.bind(this);

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.data = data;
    this.state.draft = { ...data };
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


  isSelected() {
    const { selected } = this.state;
    return selected === true;
  }

  isVisible() {
    const { visible } = this.state;
    return visible === true;
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
    const { queryIndex, queryTitle } = this.props;
    if (queryIndex === -1) {
      this.handleClose();
      return null;
    }
    return (
      <span>
        <Tag
          visible={this.isVisible()}
          onClose={this.handleClose}
          className={`${style.tag} `}
          color={this.isSelected() ? '#b5e6f7' : '#d1deea'}
          onClick={this.handleSelect}
        >
          <Tag
            color="#FFFFFF"
            className={`${style.insideTag}`}
          >
            { queryTitle }

          </Tag>
          {this.isSelected() ? <IconKit className={`${style.closingIcon}`} onClick={this.handleClose} size={16} icon={ic_cancel} /> : null}
        </Tag>
      </span>
    );
  }
}

Subquery.propTypes = {
  queryIndex: PropTypes.number,
  queryTitle: PropTypes.string,
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  onRemoveCallback: PropTypes.func,
};

Subquery.defaultProps = {
  queryIndex: null,
  queryTitle: null,
  options: {
    editable: false,
    selectable: false,
  },
  onRemoveCallback: () => {},
};

export default Subquery;
