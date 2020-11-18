import React from 'react';
import PropTypes from 'prop-types';
import {
  Tag,
} from 'antd';
import IconKit from 'react-icons-kit';
import { ic_cancel } from 'react-icons-kit/md';
import style from './styles/term.module.scss';

export const INSTRUCTION_TYPE_SUBQUERY = 'subquery';

class Subquery extends React.Component {
  /* @NOTE SQON Struct Sample
  {
      query: 'and',
  }
  */
  static structFromArgs(query) {
    return {
      query,
    };
  }

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

  handleClose() {
    if (this.isEditable()) {
      const { onRemoveCallback } = this.props;
      this.setState({
        visible: false,
      }, () => { onRemoveCallback(this.serialize()); });
    }
  }

  render() {
    const { queryIndex, queryTitle, autoSelect } = this.props;
    if (queryIndex === -1) {
      this.handleClose();
      return null;
    }
    return (
      <span>
        <Tag
          visible={this.isVisible()}
          onClose={this.handleClose}
          className={autoSelect ? `${style.tag} ${style.selectedTag}` : `${style.tag} `}
          color={autoSelect ? '#b5e6f7' : '#d1deea'}
        >
          <Tag
            color="#FFFFFF"
            className={`${style.insideTag}`}
          >
            { queryTitle }
          </Tag>
          { autoSelect
            ? <IconKit className={`${style.closingIcon}`} onClick={this.handleClose} size={16} icon={ic_cancel} />
            : null
          }
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
  autoSelect: PropTypes.bool,
  onRemoveCallback: PropTypes.func,
};

Subquery.defaultProps = {
  queryIndex: null,
  queryTitle: null,
  options: {
    editable: false,
    selectable: false,
  },
  autoSelect: false,
  onRemoveCallback: () => {},
};

export default Subquery;

export const createSubqueryInstruction = query => ({
  type: INSTRUCTION_TYPE_SUBQUERY,
  data: Subquery.structFromArgs(query),
});
